import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import voucherService from "../services/voucherService";
import type {
    CreateVoucherRequest,
    UpdateVoucherRequest,
    GetVouchersParams,
    VoucherItem,
    GetVouchersResponse,
} from "../types/voucher/voucher";

interface VoucherState {
    vouchers: GetVouchersResponse | null;
    selectedVoucher: VoucherItem | null;
    loading: boolean;
    error: string | null;
}

const initialState: VoucherState = {
    vouchers: null,
    selectedVoucher: null,
    loading: false,
    error: null,
};

export const fetchCreateVoucher = createAsyncThunk(
    "VOUCHER/create",
    async (data: CreateVoucherRequest, { rejectWithValue }) => {
        try {
            const res = await voucherService.createVoucher(data);
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.message ?? "Không thể tạo voucher");
        }
    }
);

export const fetchGetVouchers = createAsyncThunk(
    "VOUCHER/getList",
    async (params: GetVouchersParams | undefined, { rejectWithValue }) => {
        try {
            const res = await voucherService.getVouchers(params);
            return res.data.data;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.message ?? "Không thể tải danh sách voucher");
        }
    }
);

export const fetchGetVoucherById = createAsyncThunk(
    "VOUCHER/getById",
    async (voucherId: string, { rejectWithValue }) => {
        try {
            const res = await voucherService.getVoucherById(voucherId);
            return res.data.data;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.message ?? "Không thể tải voucher");
        }
    }
);

export const fetchUpdateVoucher = createAsyncThunk(
    "VOUCHER/update",
    async (
        { voucherId, data }: { voucherId: string; data: UpdateVoucherRequest },
        { rejectWithValue }
    ) => {
        try {
            await voucherService.updateVoucher(voucherId, data);
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.message ?? "Không thể cập nhật voucher");
        }
    }
);

export const fetchDeleteVoucher = createAsyncThunk(
    "VOUCHER/delete",
    async (voucherId: string, { rejectWithValue }) => {
        try {
            await voucherService.deleteVoucher(voucherId);
            return voucherId;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.message ?? "Không thể xóa voucher");
        }
    }
);

export const fetchExportExcelVoucher = createAsyncThunk<
    Blob,
    string
>(
    "VOUCHER/exportExcel",
    async (eventId, { rejectWithValue }) => {
        try {
            const res = await voucherService.exportExcelVoucher(eventId);
            return res.data;
        } catch (err) {
            return rejectWithValue("Không thể export voucher");
        }
    }
);

const voucherSlice = createSlice({
    name: "VOUCHER",
    initialState,
    reducers: {
        clearSelectedVoucher(state) {
            state.selectedVoucher = null;
            state.error = null;
        },
        clearVouchers(state) {
            state.vouchers = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchGetVouchers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchGetVouchers.fulfilled, (state, action) => {
                state.loading = false;
                state.vouchers = action.payload;
            })
            .addCase(fetchGetVouchers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(fetchGetVoucherById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchGetVoucherById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedVoucher = action.payload;
            })
            .addCase(fetchGetVoucherById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        const mutationThunks = [fetchCreateVoucher, fetchUpdateVoucher, fetchDeleteVoucher];
        mutationThunks.forEach((thunk) => {
            builder
                .addCase(thunk.pending, (state) => {
                    state.loading = true;
                    state.error = null;
                })
                .addCase(thunk.fulfilled, (state) => {
                    state.loading = false;
                })
                .addCase(thunk.rejected, (state, action) => {
                    state.loading = false;
                    state.error = action.payload as string;
                });
        });

        builder
            .addCase(fetchExportExcelVoucher.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchExportExcelVoucher.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(fetchExportExcelVoucher.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearSelectedVoucher, clearVouchers } = voucherSlice.actions;
export default voucherSlice.reducer;