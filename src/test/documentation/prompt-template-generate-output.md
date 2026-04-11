# PROMPT TEMPLATE: Generate Test Report Documentation for [ROLE_NAME]

---

## Context

Tôi cần bạn tạo file `output_[ROLE_NAME].md` hoàn chỉnh để đưa cho Claude sinh file Excel Test Report cho role **[ROLE_NAME]** của dự án AIPromo-Web.

**Đường dẫn test files:**

- Integration tests: `d:\Workspace\Projects\FE\AIPromo-Web\src\test\integration\[ROLE_NAME]\`
- Unit tests (components): `d:\Workspace\Projects\FE\AIPromo-Web\src\test\unit\components\[ROLE_NAME]\` (nếu có)
- Unit tests (hooks): `d:\Workspace\Projects\FE\AIPromo-Web\src\test\unit\hooks\`
- Unit tests (utils): `d:\Workspace\Projects\FE\AIPromo-Web\src\test\unit\utils\`

**File tham chiếu:**

- Template Excel: `d:\Workspace\Projects\FE\AIPromo-Web\src\test\documentation\Report5_Test Report.xlsx`
- File mẫu đã làm: `d:\Workspace\Projects\FE\AIPromo-Web\src\test\documentation\output3.md` (role Organizer)

---

## Nhiệm vụ

### Bước 1: Đọc tất cả Integration Test files

Đọc **TẤT CẢ** file `.test.tsx` trong folder `integration/[ROLE_NAME]/`. Với mỗi file, trả về:

1. **Tên file** (ví dụ: `AnalyticsPage.test.tsx`)
2. **Tên feature** tương ứng (ví dụ: "Analytics ([ROLE_NAME])")
3. **Tổng số `it(` blocks** – đây là số lượng test case THẬT (KHÔNG tính `describe` blocks)
4. **Danh sách tất cả `it(` test names** theo đúng thứ tự xuất hiện trong file
5. **Danh sách các `describe` blocks** (chỉ các describe trực tiếp chứa `it(`, KHÔNG tính nested describe) – đây là group labels
6. **Test requirement** – mô tả ngắn gọn feature này test gì (dựa vào tên file và nội dung test)
7. **Các mocked artifacts** trong file test:
   - Child components được mock (tên component + đường dẫn)
   - Hooks được mock
   - Utils được mock
   - Redux actions được mock
   - Libraries bên ngoài được mock (react-router-dom, recharts, v.v.)

**QUAN TRỌNG:** Phân biệt rõ:

- `describe("Render", () => { it("should render...", () => {}) })` → "Render" là **group label**, "should render..." là **test case**
- Chỉ đếm các dòng có `it(` – KHÔNG đếm `describe`

---

### Bước 2: Đọc tất cả Unit Test files liên quan

Tìm và đọc các unit test files có liên quan đến các integration test ở trên. Với mỗi unit test file:

1. **Tên file** và **đường dẫn**
2. **Số lượng `it(` blocks**
3. **Component/Hook/Util** mà file này test
4. **Mapping** – unit test này thuộc về feature integration nào (dựa vào tên component được mock trong integration test)

Ví dụ mapping:

```
Integration: AnalyticsPage.test.tsx
  → Mocks: AnalyticsCards component
  → Unit test: AnalyticsCards.test.tsx (11 test cases)
  → Mocks: useAnalyticsData hook
  → Unit test: useAnalyticsData.test.tsx (17 test cases)
```

---

### Bước 3: Tạo Feature Mapping Table

Tạo bảng tổng hợp mapping giữa Integration và Unit tests:

| #   | Feature Sheet (Integration) | Integration File       | Integration TCs | Unit Components | Unit Hooks       | Unit Utils |
| --- | --------------------------- | ---------------------- | --------------- | --------------- | ---------------- | ---------- |
| 1   | Analytics ([ROLE_NAME])     | AnalyticsPage.test.tsx | 17              | AnalyticsCards  | useAnalyticsData | –          |
| ... | ...                         | ...                    | ...             | ...             | ...              | ...        |

---

### Bước 4: Tạo File output\_[ROLE_NAME].md

Tạo file markdown với cấu trúc **GIỐNG HỆT** `output3.md` (Organizer), nhưng thay `[ROLE_NAME]` vào tất cả chỗ có "Organizer".

**Cấu trúc file bao gồm:**

#### 4.1 Header

```markdown
# Test Report – Complete Test Case Specification for Excel Generation ([ROLE_NAME])

> **Ngày test:** 11/4/2026 | **Tester:** DanhPT | **Round 1:** Tất cả = "Passed"
```

#### 4.2 Rules Section

```markdown
## Quy tắc quan trọng (RULES)

1. **KHÔNG được đổi màu** bất kỳ cell nào trong file Excel.
2. **Cột A (Test Case ID):** Group label = chỉ ghi tên group (ví dụ: "Render"). Test case thật = ghi ID (ví dụ: "AP-001").
3. **Cột F (Round 1):** Tất cả test case thật = "Passed". Group labels = để trống.
4. **Cột G (Test date):** Tất cả = "11/4/2026". Group labels = để trống.
5. **Cột H (Tester):** Tất cả = "DanhPT". Group labels = để trống.
6. **Cột I đến O (Round 2, Round 3, Note):** Để TRỐNG hoàn toàn.
7. **KHÔNG đếm các dòng group label** vào số lượng test case.
8. **Row 1** của mỗi feature sheet = hàng trống.
9. **Header block** chiếm rows 2-8.
10. **Row 10** = header cột test case.
11. **Row 11 trở đi** = dữ liệu test case + group labels xen kẽ.
12. **Công thức Number of TCs:** `=COUNTIF(A12:A1000,"*-*")`
13. **Công thức Round counting:** COUNTIF theo mẫu template.
```

#### 4.3 Column Structure

```markdown
## Cấu trúc cột Excel (15 cột A-O)

| Cột | Tên                   | Mô tả                               |
| --- | --------------------- | ----------------------------------- |
| A   | Test Case ID          | ID test case hoặc tên nhóm function |
| B   | Test Case Description | Mô tả ngắn gọn                      |
| C   | Test Case Procedure   | Các bước thực hiện                  |
| D   | Expected Results      | Kết quả mong đợi                    |
| E   | Pre-conditions        | Điều kiện tiên quyết                |
| F   | Round 1               | **Tất cả = "Passed"**               |
| G   | Test date             | **Tất cả = "11/4/2026"**            |
| H   | Tester                | **Tất cả = "DanhPT"**             |
| I   | Round 2               | **Để trống**                        |
| J   | Test date             | **Để trống**                        |
| K   | Tester                | **Để trống**                        |
| L   | Round 3               | **Để trống**                        |
| M   | Test date             | **Để trống**                        |
| N   | Tester                | **Để trống**                        |
| O   | Note                  | **Để trống**                        |
```

#### 4.4 Feature Count Table

```markdown
## Tổng quan số lượng Test Cases theo Feature

| #         | Feature Sheet           | Integration TCs | Group Labels |
| --------- | ----------------------- | --------------- | ------------ |
| 1         | Analytics ([ROLE_NAME]) | X               | Y            |
| ...       | ...                     | ...             | ...          |
| **TOTAL** |                         | **XXX**         | **YYY**      |
```

#### 4.5 Chi tiết từng Feature

Với **MỖI** feature, tạo section với cấu trúc:

```markdown
---

## Feature N: [Feature Name] ([ROLE_NAME])

**Test requirement:** [Mô tả test requirement]

**Integration Test File:** `src/test/integration/[ROLE_NAME]/[FileName].test.tsx`

**Group Labels:** [Danh sách group labels, phân cách bằng dấu phẩy]

**Mocked Artifacts:**

- **Components:** [Danh sách child components được mock]
- **Hooks:** [Danh sách hooks được mock]
- **Utils:** [Danh sách utils được mock]
- **Libraries:** [Danh sách libraries bên ngoài được mock]

| Row | Test Case ID | Test Case Description | Test Case Procedure | Expected Results   | Pre-conditions | Round 1 | Test date | Tester   |
| --- | ------------ | --------------------- | ------------------- | ------------------ | -------------- | ------- | --------- | -------- |
| 11  | [Group Name] |                       |                     |                    |                |         |           |          |
| 12  | [ID-001]     | [Tên test case]       | [Các bước test]     | [Kết quả mong đợi] | [Điều kiện]    | Passed  | 11/4/2026 | DanhPT |
| 13  | [ID-002]     | ...                   | ...                 | ...                | ...            | Passed  | 11/4/2026 | DanhPT |
| ... | ...          | ...                   | ...                 | ...                | ...            | ...     | ...       | ...      |
```

**Quy tắc điền bảng:**

- **Row 11** luôn là group label đầu tiên (để trống cột B-O)
- Sau mỗi group label, liệt kê tất cả test cases thuộc group đó
- Giữa các group, chèn 1 dòng group label mới (để trống cột B-O)
- **KHÔNG** thêm dòng trống giữa các test case trong cùng group
- **Test Case Description** = tên của `it()` block (bỏ "should" ở đầu nếu có)
- **Test Case Procedure** = mô tả ngắn các bước (dựa vào nội dung `it()` block)
- **Expected Results** = kết quả mong đợi (dựa vào assertion trong `it()`)
- **Pre-conditions** = điều kiện mock/setup (dựa vào `beforeEach` hoặc setup trong test)

#### 4.6 Summary Table

```markdown
## Summary: Tổng hợp tất cả [N] Features

| #         | Feature                 | TC Count | Group Labels | First Row | Last Row |
| --------- | ----------------------- | -------- | ------------ | --------- | -------- |
| 1         | Analytics ([ROLE_NAME]) | XX       | Y            | 12        | ZZ       |
| ...       | ...                     | ...      | ...          | ...       | ...      |
| **TOTAL** |                         | **XXX**  | **YYY**      |           |          |
```

#### 4.7 Prompt cho Claude

```markdown
## Prompt cho Claude để sinh Excel

Khi đưa prompt cho Claude, cần bao gồm:

\`\`\`
Hãy sinh file Excel với cấu trúc sau:

1. **Cover sheet**:
   - Project Name: AIPromo – Event Management Platform
   - Project Code: AIPROMO
   - Document Code: =B5&"_"&"TR"&"_"&"v1.0"
   - Creator: DanhPT
   - Issue Date: 11/4/2026
   - Version: 1.0

2. **Test Cases sheet**: Liệt kê tất cả functions theo mapping ở bảng Summary

3. **Test Statistics sheet**: Có công thức COUNTIF linking đến từng Feature sheet

4. **[N] Feature sheets**:
   - Mỗi sheet bắt đầu bằng 1 hàng trống (row 1)
   - Header block rows 2-8
   - Header cột row 10
   - Data rows 11 trở đi
   - **QUAN TRỌNG**: KHÔNG đổi màu bất kỳ cell nào
   - **Round 1**: Tất cả = "Passed"
   - **Test date**: Tất cả = "11/4/2026"
   - **Tester**: Tất cả = "DanhPT"
   - **Round 2, Round 3, Note**: Để trống

5. **Thứ tự sheets**: Cover → Test Cases → Test Statistics → [Feature 1] → [Feature 2] → ...
   \`\`\`

---

## Thứ tự sheets trong workbook

\`\`\`

1.  Cover
2.  Test Cases
3.  Test Statistics
4.  [Feature 1 Name] ([ROLE_NAME])
5.  [Feature 2 Name] ([ROLE_NAME])
    ...
    \`\`\`
```

---

## Lưu ý quan trọng

1. **CHỈ Integration Tests** – File output này CHỈ chứa integration test cases. Unit tests (~1000 test cases) đã có file test riêng trong `src/test/unit/`.
2. **Chính xác số lượng** – Đếm CHÍNH XÁC số `it(` blocks. KHÔNG đếm `describe` blocks.
3. **Đúng thứ tự** – Giữ đúng thứ tự test cases như trong file test gốc.
4. **Group labels xen kẽ** – Trong bảng feature, group labels và test cases xen kẽ nhau (group label → test cases → group label → test cases...).
5. **File tham khảo** – Dùng `output3.md` (Organizer) làm mẫu định dạng chính xác.

---

## Checklist trước khi hoàn thành

- [ ] Đã đọc TẤT CẢ integration test files trong folder `[ROLE_NAME]`
- [ ] Đã đếm CHÍNH XÁC số `it(` blocks cho mỗi file
- [ ] Đã liệt kê TẤT CẢ group labels (describe blocks trực tiếp chứa it)
- [ ] Đã mapping unit test components/hooks/utils vào từng feature
- [ ] Đã tạo bảng tổng hợp Feature Count với tổng số chính xác
- [ ] Đã điền đầy đủ Procedure, Expected Results, Pre-conditions cho mỗi test case
- [ ] Đã kiểm tra Test Case ID format đúng dạng "XX-NNN" (XX = 2 chữ viết tắt feature)
- [ ] Đã thêm section "Prompt cho Claude" ở cuối file
- [ ] Đã thêm phần "Thứ tự sheets trong workbook"
- [ ] Round 1 = "Passed", Test date = "11/4/2026", Tester = "DanhPT" cho tất cả

---

## Cách sử dụng template này

1. Thay `[ROLE_NAME]` bằng tên role thực tế (ví dụ: "Admin", "Attendee", "Staff", "Manager")
2. Chạy prompt này cho Qwen/Claude
3. Kiểm tra output theo checklist
4. Đưa output file + `Report5_Test Report.xlsx` cho Claude để sinh Excel
