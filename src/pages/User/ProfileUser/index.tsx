import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import { fetchUserDetail } from "../../../store/authSlice";
import type { UserProfile, UserProfileRequest } from "../../../types/auth/auth";
import authService from "../../../services/authService";


// ── Helpers ────────────────────────────────────────────────────────
const formatNgayTao = (iso: string) =>
  new Date(iso).toLocaleDateString("vi-VN", { year: "numeric", month: "short", day: "2-digit" });

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" });

const formatBirthday = (iso: string | null) => {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const toDateInput = (iso: string | null) => (iso ? iso.slice(0, 10) : "");

const genderLabel = (g: string | null) => {
  if (g === "Male") return "Nam";
  if (g === "Female") return "Nữ";
  if (g === "Other") return "Khác";
  return null;
};

const formatVND = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

// ── Wallet Deposit Modal ───────────────────────────────────────────
const PRESET_AMOUNTS = [50_000, 100_000, 200_000, 500_000, 1_000_000, 2_000_000];

const WalletModal: React.FC<{
  onClose: () => void;
  onConfirm: (amount: number) => void;
}> = ({ onClose, onConfirm }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);

  const finalAmount = custom ? parseInt(custom.replace(/\D/g, ""), 10) : selected;

  const handleConfirm = async () => {
    if (!finalAmount || finalAmount < 10_000) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900)); // TODO: gọi API nạp tiền
    setLoading(false);
    onConfirm(finalAmount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-2xl p-6 border border-white/10 z-10"
        style={{ background: "#18122B", boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(121,59,237,0.2)" }}
            >
              <span className="material-symbols-outlined text-[18px]" style={{ color: "#793bed" }}>
                account_balance_wallet
              </span>
            </div>
            <h3 className="text-white font-bold text-lg">Nạp tiền vào ví</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Preset amounts */}
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
          Chọn mệnh giá
        </p>
        <div className="grid grid-cols-3 gap-2 mb-5">
          {PRESET_AMOUNTS.map((amt) => (
            <button
              key={amt}
              onClick={() => { setSelected(amt); setCustom(""); }}
              className="py-2.5 rounded-xl text-xs font-bold transition-all"
              style={{
                background: selected === amt && !custom
                  ? "rgba(121,59,237,0.25)"
                  : "rgba(255,255,255,0.04)",
                border: `1px solid ${selected === amt && !custom
                  ? "rgba(121,59,237,0.5)"
                  : "rgba(255,255,255,0.08)"}`,
                color: selected === amt && !custom ? "#a78bfa" : "#94a3b8",
              }}
            >
              {formatVND(amt)}
            </button>
          ))}
        </div>

        {/* Custom input */}
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
          Hoặc nhập số tiền khác
        </p>
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-3 mb-6 border transition-all"
          style={{
            background: "#1A1F2E",
            borderColor: custom ? "rgba(121,59,237,0.5)" : "rgba(255,255,255,0.08)",
            boxShadow: custom ? "0 0 0 3px rgba(121,59,237,0.08)" : "none",
          }}
        >
          <span className="text-slate-500 text-sm font-bold shrink-0">VND</span>
          <input
            type="text"
            placeholder="Nhập số tiền (tối thiểu 10.000đ)"
            value={custom}
            onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, "");
              setCustom(raw);
              setSelected(null);
            }}
            className="flex-1 bg-transparent text-white text-sm font-medium outline-none placeholder-slate-600"
          />
        </div>

        {/* Preview */}
        {finalAmount && finalAmount >= 10_000 && (
          <div
            className="flex items-center justify-between px-4 py-3 rounded-xl mb-5 border border-white/5"
            style={{ background: "rgba(121,59,237,0.08)" }}
          >
            <span className="text-slate-400 text-sm">Số tiền nạp</span>
            <span className="text-white font-bold text-sm">{formatVND(finalAmount)}</span>
          </div>
        )}

        {/* Confirm button */}
        <button
          onClick={handleConfirm}
          disabled={!finalAmount || finalAmount < 10_000 || loading}
          className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all"
          style={{
            background:
              !finalAmount || finalAmount < 10_000
                ? "rgba(121,59,237,0.25)"
                : loading
                ? "rgba(121,59,237,0.5)"
                : "#793bed",
            boxShadow:
              finalAmount && finalAmount >= 10_000 && !loading
                ? "0 4px 20px rgba(121,59,237,0.4)"
                : "none",
            cursor: !finalAmount || finalAmount < 10_000 ? "not-allowed" : "pointer",
          }}
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Đang xử lý…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">add_card</span>
              Xác nhận nạp tiền
            </>
          )}
        </button>
      </div>
    </div>
  );
};

interface AvatarProps {
  profileImageUrl: string | null | undefined;
  initials: string;
  isActive: boolean;
  userId: string;
  onUploaded: (newUrl: string) => void;
}

const AvatarUpload: React.FC<AvatarProps> = ({
  profileImageUrl,
  initials,
  isActive,
  userId,
  onUploaded,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const displayUrl = previewUrl ?? profileImageUrl ?? null;

 const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    setUploadError("Chỉ chấp nhận file ảnh.");
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    setUploadError("Ảnh tối đa 5 MB.");
    return;
  }

  // Preview ngay
  const objectUrl = URL.createObjectURL(file);
  setPreviewUrl(objectUrl);
  setUploadError(null);

  setUploading(true);
  try {
    const response = await authService.uploadProfileImage(userId, file);

    const json = response.data;

    const newUrl =
      json?.profileImageUrl ??
      json?.imageUrl ??
      json?.url ??
      json?.data?.profileImageUrl ??
      null;

    onUploaded(newUrl ?? objectUrl);
  } catch (err: any) {
    setUploadError(
      err?.response?.data?.message ??
      err?.message ??
      "Upload thất bại, vui lòng thử lại."
    );

    // rollback preview
    setPreviewUrl(null);
    URL.revokeObjectURL(objectUrl);
  } finally {
    setUploading(false);

    // reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  }
};

  return (
    <div className="relative shrink-0 group">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Avatar */}
      <div
        className="w-32 h-32 md:w-36 md:h-36 rounded-2xl flex items-center justify-center text-white font-bold text-4xl border-4 overflow-hidden cursor-pointer select-none"
        style={{
          background: displayUrl ? "transparent" : "linear-gradient(135deg, #793bed, #a855f7)",
          borderColor: "rgba(121,59,237,0.35)",
          boxShadow: "0 20px 60px rgba(121,59,237,0.3)",
        }}
        onClick={() => !uploading && fileInputRef.current?.click()}
        title="Nhấn để đổi ảnh đại diện"
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt="Avatar"
            className="w-full h-full object-cover"
            onError={() => setPreviewUrl(null)}
          />
        ) : (
          initials
        )}
      </div>

      {/* Hover overlay — camera icon */}
      <div
        className="absolute inset-0 rounded-2xl flex items-center justify-center transition-all pointer-events-none"
        style={{
          background: uploading
            ? "rgba(0,0,0,0.55)"
            : "rgba(0,0,0,0)",
          opacity: uploading ? 1 : undefined,
        }}
      >
        {uploading ? (
          <svg className="animate-spin w-7 h-7 text-white" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
          </svg>
        ) : (
          <div
            className="flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ pointerEvents: "none" }}
          >
            {/* Dark overlay on hover via group */}
          </div>
        )}
      </div>

      {/* CSS-driven hover dark overlay + camera icon */}
      <style>{`
        .avatar-wrap:hover .avatar-overlay { opacity: 1 !important; }
      `}</style>
      <div
        className="absolute inset-0 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        style={{
          background: "rgba(0,0,0,0.50)",
          display: uploading ? "none" : undefined,
        }}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-1.5">
          <span className="material-symbols-outlined text-white text-3xl">photo_camera</span>
          <span className="text-white text-[10px] font-bold tracking-wide">Đổi ảnh</span>
        </div>
      </div>

      {/* Verified badge */}
      {isActive && (
        <div className="absolute -bottom-2 -right-2 p-1.5 rounded-lg z-10" style={{ background: "#793bed" }}>
          <span className="material-symbols-outlined text-white text-sm">verified</span>
        </div>
      )}

      {/* Upload error tooltip */}
      {uploadError && (
        <div
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-lg text-[11px] font-medium text-red-300 border border-red-500/20 z-20"
          style={{ background: "rgba(239,68,68,0.12)" }}
        >
          {uploadError}
        </div>
      )}
    </div>
  );
};

// ── Build form helper ──────────────────────────────────────────────
const buildForm = (u: UserProfile) => ({
  firstName: u.firstName,
  lastName: u.lastName,
  userName: u.userName,
  address: u.address ?? "",
  birthday: toDateInput(u.birthday),
  gender: u.gender ?? "",
  socialLink: (u as any).socialLink ?? "",
});

const ProfileUser: React.FC = () => {

  const { currentInfor } = useSelector((state: RootState) => state.AUTH);
  const userId = (currentInfor as any)?.userId as string | undefined;

  const user = useSelector((state: RootState) => state.AUTH.userDetail) as UserProfile | null;

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserDetail(userId));
    }
  }, [userId, dispatch]);

  useEffect(() => {
    if (user) {
      setForm(buildForm(user));
      // Sync profileImageUrl from server into local state
      setAvatarUrl(user.profileImageUrl ?? null);
    }
  }, [user]);

  // Local avatar URL — updated instantly after successful upload
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Wallet state
  const [walletBalance, setWalletBalance] = useState(350_000);
  const [showWalletModal, setShowWalletModal] = useState(false);

  // Form state
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    address: "",
    birthday: "",
    gender: "",
    socialLink: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    if (!user || !userId) return;
    setSaving(true);
    setSaveError(null);
    try {
      const payload: UserProfileRequest = {
        userId,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        birthday: form.birthday,
        gender: form.gender,
        phone: user.phoneNumber ?? "",
        address: form.address.trim(),
        description: (user as any).description ?? "",
        socialLink: form.socialLink.trim(),
        profileImageUrl: avatarUrl ?? (user as any).profileImageUrl ?? "",
      };
      await authService.updateUser(payload);
      dispatch(fetchUserDetail(userId));
      setEditMode(false);
    } catch (err: any) {
      setSaveError(err?.response?.data?.message ?? "Lưu thất bại, vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setForm(buildForm(user));
    }
    setEditMode(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin w-8 h-8 text-purple-500" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  const fullName = editMode
    ? `${form.firstName} ${form.lastName}`.trim()
    : `${user.firstName} ${user.lastName}`.trim();

  const initials = [
    user.firstName?.trim().charAt(0) ?? "",
    user.lastName?.trim().charAt(0) ?? "",
  ]
    .join("")
    .toUpperCase();

  const roles: string[] = Array.isArray(user.roles) ? user.roles : [];

  return (
    <>
      {showWalletModal && (
        <WalletModal
          onClose={() => setShowWalletModal(false)}
          onConfirm={(amount) => setWalletBalance((prev) => prev + amount)}
        />
      )}

      <div className="px-6 pb-16 pt-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        <div className="max-w-5xl mx-auto">

          <section
            className="mb-8 relative overflow-hidden rounded-2xl p-8 md:p-10 border border-white/5"
            style={{ background: "#18122B" }}
          >
            <div
              className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
              style={{ background: "rgba(121,59,237,0.10)", filter: "blur(80px)" }}
            />

            <div className="flex flex-col md:flex-row items-center md:items-end gap-8 relative z-10">
              {/* ── Avatar with upload ── */}
              {userId && (
                <AvatarUpload
                  profileImageUrl={avatarUrl}
                  initials={initials}
                  isActive={user.isActive}
                  userId={userId}
                  onUploaded={(newUrl) => setAvatarUrl(newUrl)}
                />
              )}

              {/* Tên & meta */}
              <div className="text-center md:text-left flex-1">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
                  {fullName}
                </h1>
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                  <span
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-white/10"
                    style={{ background: "rgba(255,255,255,0.05)", color: "#94a3b8" }}
                  >
                    <span className="material-symbols-outlined text-xs">alternate_email</span>
                    {editMode ? form.userName : user.userName}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="material-symbols-outlined text-xs">calendar_today</span>
                    Tham gia {formatNgayTao(user.createdAt)}
                  </span>
                  {roles.map((r) => (
                    <span
                      key={r}
                      className="px-2.5 py-0.5 rounded-full text-xs font-bold border"
                      style={{
                        background: "rgba(121,59,237,0.15)",
                        borderColor: "rgba(121,59,237,0.3)",
                        color: "#a78bfa",
                      }}
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              {/* Nút chỉnh sửa */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="flex gap-3">
                {editMode ? (
                  <>
                    <button
                      onClick={handleCancel}
                      className="px-5 py-2.5 rounded-xl text-sm font-bold border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                    >
                      Huỷ
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
                      style={{
                        background: saving ? "rgba(121,59,237,0.45)" : "#793bed",
                        boxShadow: saving ? "none" : "0 4px 20px rgba(121,59,237,0.4)",
                      }}
                    >
                      {saving ? (
                        <>
                          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                            <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                          </svg>
                          Đang lưu…
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[16px]">save</span>
                          Lưu
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditMode(true)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white hover:scale-105 transition-transform"
                    style={{ background: "#793bed", boxShadow: "0 4px 20px rgba(121,59,237,0.35)" }}
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    Chỉnh sửa
                  </button>
                )}
                </div>
                {saveError && (
                  <p className="text-xs font-medium text-red-400 text-right">{saveError}</p>
                )}
              </div>
            </div>
          </section>

          {/* ── Bento Grid ───────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Thông tin cá nhân ─────────────────────── */}
            <div
              className="lg:col-span-2 rounded-2xl p-8 relative border border-white/5"
              style={{ background: "rgba(24,18,43,0.8)", backdropFilter: "blur(12px)" }}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold tracking-tight" style={{ color: "#793bed" }}>
                  Thông tin cá nhân
                </h2>
                {editMode && (
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(121,59,237,0.15)", color: "#a78bfa", border: "1px solid rgba(121,59,237,0.25)" }}
                  >
                    Đang chỉnh sửa
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                <TruongThongTin label="Họ" editMode={editMode}>
                  {editMode
                    ? <EditInput value={form.firstName} onChange={set("firstName")} />
                    : <span>{user.firstName}</span>}
                </TruongThongTin>

                <TruongThongTin label="Tên" editMode={editMode}>
                  {editMode
                    ? <EditInput value={form.lastName} onChange={set("lastName")} />
                    : <span>{user.lastName}</span>}
                </TruongThongTin>

                <TruongThongTin label="Email" locked>
                  <span>{user.email}</span>
                </TruongThongTin>

                <TruongThongTin label="Số điện thoại" locked>
                  <span>{user.phoneNumber}</span>
                </TruongThongTin>

                <TruongThongTin label="Tên đăng nhập" editMode={editMode}>
                  {editMode
                    ? <EditInput value={form.userName} onChange={set("userName")} />
                    : <span>{user.userName}</span>}
                </TruongThongTin>

                <TruongThongTin label="Vai trò">
                  <div className="flex gap-2 flex-wrap">
                    {roles.length > 0 ? roles.map((r) => (
                      <span
                        key={r}
                        className="inline-block px-3 py-1 rounded-full text-xs font-bold border"
                        style={{ background: "rgba(121,59,237,0.2)", color: "#793bed", borderColor: "rgba(121,59,237,0.3)" }}
                      >
                        {r}
                      </span>
                    )) : <span className="text-slate-500 text-sm">Người dùng thường</span>}
                  </div>
                </TruongThongTin>

                <TruongThongTin label="Giới tính" editMode={editMode}>
                  {editMode ? (
                    <select
                      value={form.gender}
                      onChange={set("gender")}
                      className="bg-transparent text-white text-lg font-medium outline-none w-full"
                    >
                      <option value="" style={{ background: "#18122B", color: "#475569" }}>-- Chọn --</option>
                      <option value="Male" style={{ background: "#18122B" }}>Nam</option>
                      <option value="Female" style={{ background: "#18122B" }}>Nữ</option>
                      <option value="Other" style={{ background: "#18122B" }}>Khác</option>
                    </select>
                  ) : (
                    <span style={{ color: user.gender ? "white" : "#475569" }}>
                      {genderLabel(user.gender) ?? "Chưa cập nhật"}
                    </span>
                  )}
                </TruongThongTin>

                <TruongThongTin label="Ngày sinh" editMode={editMode}>
                  {editMode ? (
                    <input
                      type="date"
                      value={form.birthday}
                      onChange={set("birthday")}
                      className="bg-transparent text-white text-lg font-medium outline-none w-full"
                      style={{ colorScheme: "dark" }}
                    />
                  ) : (
                    <span style={{ color: user.birthday ? "white" : "#475569" }}>
                      {formatBirthday(user.birthday) ?? "Chưa cập nhật"}
                    </span>
                  )}
                </TruongThongTin>

                <div className="md:col-span-2 pt-4 border-t border-white/5">
                  <TruongThongTin label="Địa chỉ" editMode={editMode}>
                    {editMode ? (
                      <textarea
                        value={form.address}
                        onChange={set("address")}
                        rows={2}
                        className="w-full bg-transparent text-white text-lg font-medium outline-none resize-none leading-relaxed"
                        placeholder="Nhập địa chỉ..."
                      />
                    ) : (
                      <span className="leading-relaxed" style={{ color: user.address ? "white" : "#475569" }}>
                        {user.address ?? "Chưa cập nhật"}
                      </span>
                    )}
                  </TruongThongTin>
                </div>

                <div className="md:col-span-2 pt-4 border-t border-white/5">
                  <TruongThongTin label="Social / Website" editMode={editMode}>
                    {editMode ? (
                      <EditInput
                        value={form.socialLink}
                        onChange={set("socialLink")}
                        placeholder="https://..."
                      />
                    ) : (
                      (user as any).socialLink ? (
                        <a
                          href={(user as any).socialLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 hover:underline"
                          style={{ color: "#a78bfa" }}
                        >
                          <span className="material-symbols-outlined text-[16px]">link</span>
                          {(user as any).socialLink}
                        </a>
                      ) : (
                        <span style={{ color: "#475569" }}>Chưa cập nhật</span>
                      )
                    )}
                  </TruongThongTin>
                </div>

              </div>
            </div>

            {/* ── Cột phải ─────────────────────────────── */}
            <div className="space-y-6">

              {/* Ví của bạn */}
              <div
                className="rounded-2xl p-6 border border-white/5 relative overflow-hidden"
                style={{ background: "rgba(24,18,43,0.8)", backdropFilter: "blur(12px)" }}
              >
                <div
                  className="absolute -top-6 -right-6 w-32 h-32 rounded-full pointer-events-none"
                  style={{ background: "rgba(121,59,237,0.15)", filter: "blur(40px)" }}
                />

                <h3 className="text-sm font-bold text-slate-400 mb-5 flex items-center gap-2 relative z-10">
                  <span className="material-symbols-outlined text-sm" style={{ color: "#793bed" }}>
                    account_balance_wallet
                  </span>
                  Ví của bạn
                </h3>

                <div className="relative z-10 mb-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                    Số dư hiện tại
                  </p>
                  <p className="text-3xl font-bold text-white tracking-tight">
                    {formatVND(walletBalance)}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: "#22c55e" }} />
                    <span className="text-[11px] text-slate-500">Ví đang hoạt động</span>
                  </div>
                </div>

                <div
                  className="rounded-xl px-4 py-3 mb-5 border border-white/5 relative z-10"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Giao dịch gần nhất
                    </span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "Mua vé - AI Summit", amount: -150_000, date: "20/03" },
                      { label: "Nạp tiền", amount: +500_000, date: "18/03" },
                      { label: "Mua vé - Music Expo", amount: -200_000, date: "15/03" },
                    ].map((tx, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-xs text-slate-300 truncate">{tx.label}</p>
                          <p className="text-[10px] text-slate-600">{tx.date}</p>
                        </div>
                        <span
                          className="text-xs font-bold shrink-0 ml-2"
                          style={{ color: tx.amount > 0 ? "#4ade80" : "#f87171" }}
                        >
                          {tx.amount > 0 ? "+" : ""}{formatVND(tx.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setShowWalletModal(true)}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] relative z-10"
                  style={{
                    background: "linear-gradient(135deg, #793bed, #a855f7)",
                    boxShadow: "0 4px 20px rgba(121,59,237,0.35)",
                  }}
                >
                  <span className="material-symbols-outlined text-[18px]">add_card</span>
                  Nạp tiền vào ví
                </button>
              </div>

              {/* Thông tin tài khoản */}
              <div
                className="rounded-2xl p-6 border border-white/5"
                style={{ background: "rgba(24,18,43,0.8)", backdropFilter: "blur(12px)" }}
              >
                <h3 className="text-sm font-bold text-slate-400 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">history</span>
                  Thông tin tài khoản
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Ngày tạo</p>
                    <p className="text-slate-300 text-xs mt-0.5">{formatDate(user.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Cập nhật lần cuối</p>
                    <p className="text-slate-300 text-xs mt-0.5">{formatDate(user.modifiedAt)}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-xs text-slate-400">Trạng thái tài khoản</span>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                      style={{
                        background: user.isActive ? "rgba(34,197,94,0.10)" : "rgba(239,68,68,0.10)",
                        color: user.isActive ? "#22c55e" : "#f87171",
                        borderColor: user.isActive ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)",
                      }}
                    >
                      {user.isActive ? "Đang hoạt động" : "Bị khoá"}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

      
        </div>
      </div>
    </>
  );
};

// ── Sub-components ─────────────────────────────────────────────────

interface TruongThongTinProps {
  label: string;
  editMode?: boolean;
  locked?: boolean;
  children: React.ReactNode;
}

const TruongThongTin: React.FC<TruongThongTinProps> = ({ label, editMode, locked, children }) => (
  <div className="space-y-1.5">
    <div className="flex items-center gap-1">
      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{label}</p>
      {locked && (
        <span className="material-symbols-outlined text-[11px] text-slate-600">lock</span>
      )}
    </div>
    <div
      className="text-white text-lg font-medium transition-all"
      style={{
        borderBottom: editMode && !locked ? "1px solid rgba(121,59,237,0.5)" : "none",
        paddingBottom: editMode && !locked ? "4px" : "0",
      }}
    >
      {children}
    </div>
  </div>
);

const EditInput: React.FC<{
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}> = ({ value, onChange, placeholder }) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full bg-transparent text-white text-lg font-medium outline-none placeholder-slate-600"
  />
);


export default ProfileUser;