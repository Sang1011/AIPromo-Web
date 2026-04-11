# Test Report – Complete Test Case Specification for Excel Generation

> **Mục đích:** Cung cấp đầy đủ thông tin để AI (Claude/Qwen) sinh lại file Excel `.xlsx` với cấu trúc giống hệt template `Report5_Test Report.xlsx`. File này chứa **436 Integration Test Cases** từ 24 feature sheets, **KHÔNG bao gồm Unit Tests** (unit tests đã có file riêng).

> **Ngày test:** 11/4/2026 | **Tester:** SangNHT | **Round 1:** Tất cả = "Passed"

---

## Quy tắc quan trọng (RULES)

1. **KHÔNG được đổi màu** bất kỳ cell nào trong file Excel. Giữ nguyên màu mặc định.
2. **Cột A (Test Case ID):** Nếu là tên nhóm function (header group), chỉ ghi tên function (ví dụ: "Render", "UI Elements"). Nếu là test case thật, ghi ID (ví dụ: "AP-001").
3. **Cột F (Round 1):** Tất cả test case thật = "Passed". Các dòng group label = để trống.
4. **Cột G (Test date):** Tất cả = "11/4/2026". Các dòng group label = để trống.
5. **Cột H (Tester):** Tất cả = "SangNHT". Các dòng group label = để trống.
6. **Cột I đến O (Round 2, Round 3, Note):** Để TRỐNG hoàn toàn.
7. **KHÔNG đếm các dòng group label** vào số lượng test case (Number of TCs). Chỉ đếm các dòng có Test Case ID dạng "XX-NNN".
8. **Row 1** của mỗi feature sheet = hàng trống.
9. **Header block** chiếm rows 2-8 (Feature info, Testing Round summary).
10. **Row 10** = header cột test case (Test Case ID, Description, Procedure, Expected Results, Pre-conditions, Round 1, Test date, Tester, Round 2, Test date, Tester, Round 3, Test date, Tester, Note).
11. **Row 11 trở đi** = dữ liệu test case + group labels xen kẽ.
12. **Công thức Number of TCs (cell B4):** `=COUNTIF(A12:A1000,"*-*")` – chỉ đếm các ô có dấu gạch ngang (dạng XX-NNN).
13. **Công thức Round counting (rows 6-8):** Sử dụng COUNTIF theo mẫu template.

---

## Cấu trúc cột Excel (15 cột A-O)

| Cột | Tên                   | Mô tả                                                               |
| --- | --------------------- | ------------------------------------------------------------------- |
| A   | Test Case ID          | ID test case (dạng XX-NNN) hoặc tên nhóm function                   |
| B   | Test Case Description | Mô tả ngắn gọn test case                                            |
| C   | Test Case Procedure   | Các bước thực hiện test                                             |
| D   | Expected Results      | Kết quả mong đợi                                                    |
| E   | Pre-conditions        | Điều kiện tiên quyết                                                |
| F   | Round 1               | Kết quả round 1 (Passed/Failed/Pending/N/A) – **Tất cả = "Passed"** |
| G   | Test date             | Ngày test – **Tất cả = "11/4/2026"**                                |
| H   | Tester                | Người test – **Tất cả = "SangNHT"**                                 |
| I   | Round 2               | **Để trống**                                                        |
| J   | Test date             | **Để trống**                                                        |
| K   | Tester                | **Để trống**                                                        |
| L   | Round 3               | **Để trống**                                                        |
| M   | Test date             | **Để trống**                                                        |
| N   | Tester                | **Để trống**                                                        |
| O   | Note                  | **Để trống**                                                        |

---

## Tổng quan số lượng Test Cases theo Feature

| #         | Feature Sheet                    | Integration TCs | Group Labels |
| --------- | -------------------------------- | --------------- | ------------ |
| 1         | Analytics (Organizer)            | 17              | 6            |
| 2         | CheckIn (Organizer)              | 20              | 7            |
| 3         | CreateEvent (Organizer)          | 10              | 5            |
| 4         | EditEventWizard (Organizer)      | 22              | 6            |
| 5         | EventTicket (Organizer)          | 24              | 6            |
| 6         | Legal (Organizer)                | 10              | 5            |
| 7         | LegalDetail (Organizer)          | 16              | 5            |
| 8         | Marketing (Organizer)            | 4               | 3            |
| 9         | MarketingDetail (Organizer)      | 9               | 5            |
| 10        | MemberManagement (Organizer)     | 31              | 6            |
| 11        | MyEvents (Organizer)             | 34              | 7            |
| 12        | OrderList (Organizer)            | 10              | 5            |
| 13        | OrganizerAccount (Organizer)     | 20              | 7            |
| 14        | OrganizerOverviewAll (Organizer) | 20              | 6            |
| 15        | PackageOrderFailed (Organizer)   | 12              | 4            |
| 16        | PackageOrderSuccess (Organizer)  | 14              | 4            |
| 17        | PackageVNPayReturn (Organizer)   | 9               | 4            |
| 18        | PostPreview (Organizer)          | 13              | 6            |
| 19        | ReportManagement (Organizer)     | 3               | 2            |
| 20        | SeatMapEditor (Organizer)        | 11              | 4            |
| 21        | SeatMapViewer (Organizer)        | 12              | 4            |
| 22        | Subscription (Organizer)         | 35              | 6            |
| 23        | Summary (Organizer)              | 30              | 6            |
| 24        | VoucherManagement (Organizer)    | 40              | 6            |
| **TOTAL** |                                  | **436**         | **129**      |

---

# Chi tiết từng Feature Sheet

---

## Feature 1: Analytics (Organizer)

**Test requirement:** Verify organizer can view Facebook distribution analytics including KPI cards, charts, engagement breakdown, and top-5 posts table.

**Integration Test File:** `src/test/integration/Organizer/AnalyticsPage.test.tsx`

**Group Labels:** Render, UI Elements, User Interactions, Data Display, Edge Cases, Loading States

| Row | Test Case ID      | Test Case Description                               | Test Case Procedure                                                                 | Expected Results                     | Pre-conditions                           | Round 1 | Test date | Tester  |
| --- | ----------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------ | ---------------------------------------- | ------- | --------- | ------- |
| 11  | Render            | _(Group label – skip columns F-H)_                  | _(Group label)_                                                                     | _(Group label)_                      | _(Group label)_                          |         |           |         |
| 12  | AP-001            | Render page title                                   | 1. Mock useParams eventId. 2. Render AnalyticsPage. 3. Query "Phân tích dữ liệu".   | Page title present.                  | Mock useParams, Redux, useAnalyticsData. | Passed  | 11/4/2026 | SangNHT |
| 13  | AP-002            | Show loading state when data is loading             | 1. Mock isLoading:true. 2. Render. 3. Query .animate-pulse.                         | Skeleton elements present.           | useAnalyticsData returns isLoading:true. | Passed  | 11/4/2026 | SangNHT |
| 14  | AP-003            | Show empty state when no data available             | 1. Mock empty postsWithMetrics. 2. Render. 3. Query "Chưa có dữ liệu Facebook".     | Empty state message displayed.       | useAnalyticsData returns empty array.    | Passed  | 11/4/2026 | SangNHT |
| 15  | UI Elements       | _(Group label)_                                     | _(Group label)_                                                                     | _(Group label)_                      | _(Group label)_                          |         |           |         |
| 16  | AP-004            | Render page title                                   | Render with default mocks. Query "Phân tích dữ liệu".                               | Title displayed.                     | Default mocks.                           | Passed  | 11/4/2026 | SangNHT |
| 17  | AP-005            | Render refresh button                               | Render. Query "Làm mới".                                                            | Refresh button present.              | Default mocks.                           | Passed  | 11/4/2026 | SangNHT |
| 18  | AP-006            | Render post count in subtitle                       | Mock 1 post. Render. Query "1 bài đã phân tích".                                    | Subtitle shows correct count.        | useAnalyticsData returns 1 post.         | Passed  | 11/4/2026 | SangNHT |
| 19  | User Interactions | _(Group label)_                                     | _(Group label)_                                                                     | _(Group label)_                      | _(Group label)_                          |         |           |         |
| 20  | AP-007            | Call refresh when clicking refresh button           | Mock refresh fn. Click refresh button. Assert called.                               | mockRefresh called.                  | useAnalyticsData provides refresh fn.    | Passed  | 11/4/2026 | SangNHT |
| 21  | AP-008            | Disable refresh button when loading                 | Mock isLoading:true. Assert refresh button disabled.                                | Button disabled.                     | isLoading:true.                          | Passed  | 11/4/2026 | SangNHT |
| 22  | Data Display      | _(Group label)_                                     | _(Group label)_                                                                     | _(Group label)_                      | _(Group label)_                          |         |           |         |
| 23  | AP-009            | Display analytics components when data is available | Mock 2 posts. Render. Verify all section headers present.                           | All 5 sections present.              | 2 posts with full metrics.               | Passed  | 11/4/2026 | SangNHT |
| 24  | AP-010            | Show correct post count in subtitle                 | Mock 3 posts. Query "3 bài đã phân tích".                                           | Correct count displayed.             | 3 posts.                                 | Passed  | 11/4/2026 | SangNHT |
| 25  | AP-011            | Show top 5 posts in table                           | Mock 10 posts. Query "Top 5".                                                       | Table header shows "Top 5 / 10 bài". | 10 posts.                                | Passed  | 11/4/2026 | SangNHT |
| 26  | Edge Cases        | _(Group label)_                                     | _(Group label)_                                                                     | _(Group label)_                      | _(Group label)_                          |         |           |         |
| 27  | AP-012            | Handle posts with null publishedAt                  | Mock post with publishedAt:null. Query "Reach theo bài đăng".                       | Renders without error.               | Post with null publishedAt.              | Passed  | 11/4/2026 | SangNHT |
| 28  | AP-013            | Handle posts with zero metrics                      | Mock post with all metrics:0. Query "Tổng Reach".                                   | KPI card visible.                    | Post with zero metrics.                  | Passed  | 11/4/2026 | SangNHT |
| 29  | AP-014            | Handle eventId from URL params                      | Mock eventId:"test-event-123". Verify useAnalyticsData called with correct eventId. | Correct eventId passed to hook.      | useParams returns specific eventId.      | Passed  | 11/4/2026 | SangNHT |
| 30  | AP-015            | Handle missing eventId gracefully                   | Mock eventId:undefined. Render. Query title.                                        | Page renders without crashing.       | eventId undefined.                       | Passed  | 11/4/2026 | SangNHT |
| 31  | Loading States    | _(Group label)_                                     | _(Group label)_                                                                     | _(Group label)_                      | _(Group label)_                          |         |           |         |
| 32  | AP-016            | Show skeleton during initial load                   | Mock isLoading:true. Query .animate-pulse count>=1.                                 | Skeleton exists.                     | isLoading:true.                          | Passed  | 11/4/2026 | SangNHT |
| 33  | AP-017            | Hide skeleton when not loading                      | Mock isLoading:false with data. Query .animate-pulse count==0.                      | No skeleton.                         | Data loaded.                             | Passed  | 11/4/2026 | SangNHT |

---

## Feature 2: CheckIn (Organizer)

**Test requirement:** Verify organizer can view event check-in statistics, select sessions, view real-time SignalR updates, and manage ticket-type breakdown.

**Integration Test File:** `src/test/integration/Organizer/CheckInPage.test.tsx`

**Group Labels:** Render, UI Elements, API Calls, User Interactions, Data Display, Edge Cases, Realtime Updates

| Row | Test Case ID      | Test Case Description                                    | Test Case Procedure                                              | Expected Results                       | Pre-conditions                        | Round 1 | Test date | Tester  |
| --- | ----------------- | -------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------- | ------------------------------------- | ------- | --------- | ------- |
| 11  | Render            |                                                          |                                                                  |                                        |                                       |         |           |         |
| 12  | CP-001            | Render without crashing                                  | Render CheckInPage. Assert skeleton not in document.             | Page renders normally.                 | Default mocks.                        | Passed  | 11/4/2026 | SangNHT |
| 13  | CP-002            | Show loading skeleton when loading                       | Set loading:true. Query checkin-skeleton.                        | Skeleton present.                      | Redux loading:true.                   | Passed  | 11/4/2026 | SangNHT |
| 14  | CP-003            | Show empty state when no stats available                 | Mock sessions, checkInStats:null. Query "Không có dữ liệu".      | Empty message displayed.               | sessions loaded, no stats.            | Passed  | 11/4/2026 | SangNHT |
| 15  | UI Elements       |                                                          |                                                                  |                                        |                                       |         |           |         |
| 16  | CP-004            | Render session selector when sessions exist              | Mock 2 sessions, stats. Query session-selector.                  | Selector present.                      | Sessions and stats loaded.            | Passed  | 11/4/2026 | SangNHT |
| 17  | CP-005            | Show disabled option when no sessions                    | Mock sessions:[]. Query "Vui lòng chọn".                         | Message displayed.                     | Empty sessions.                       | Passed  | 11/4/2026 | SangNHT |
| 18  | CP-006            | Render checkin overview when stats exist                 | Mock sessions, stats. Query checkin-overview.                    | Overview rendered.                     | Stats loaded.                         | Passed  | 11/4/2026 | SangNHT |
| 19  | API Calls         |                                                          |                                                                  |                                        |                                       |         |           |         |
| 20  | CP-007            | Call fetchSessions when eventId is provided              | Render with eventId. Assert dispatch called with fetchSessions.  | fetchSessions dispatched.              | eventId provided.                     | Passed  | 11/4/2026 | SangNHT |
| 21  | CP-008            | Call fetchCheckInOrganizerStats when session is selected | Mock sessions. Wait. Assert dispatch called with correct params. | fetchCheckInOrganizerStats dispatched. | Sessions loaded.                      | Passed  | 11/4/2026 | SangNHT |
| 22  | User Interactions |                                                          |                                                                  |                                        |                                       |         |           |         |
| 23  | CP-009            | Change session when selecting different option           | Mock 2 sessions. Select session-2. Assert value changed.         | Selector value is session-2.           | 2 sessions available.                 | Passed  | 11/4/2026 | SangNHT |
| 24  | CP-010            | Reset stats when changing session                        | Change session. Assert checkin-overview removed.                 | Overview removed (reset).              | useCheckInRealtime returns undefined. | Passed  | 11/4/2026 | SangNHT |
| 25  | Data Display      |                                                          |                                                                  |                                        |                                       |         |           |         |
| 26  | CP-011            | Display checkin stats correctly                          | Mock totalTickets:500, 2 ticket types. Assert counts.            | Correct values displayed.              | Stats with 2 ticket types.            | Passed  | 11/4/2026 | SangNHT |
| 27  | CP-012            | Display session titles in dropdown                       | Mock 2 sessions with titles. Assert selector displays first.     | First session shown.                   | Sessions with titles.                 | Passed  | 11/4/2026 | SangNHT |
| 28  | CP-013            | Show no data message for selected session with no stats  | Mock sessions, checkInStats:null. Query empty message.           | Message displayed.                     | No stats for session.                 | Passed  | 11/4/2026 | SangNHT |
| 29  | Edge Cases        |                                                          |                                                                  |                                        |                                       |         |           |         |
| 30  | CP-014            | Handle missing eventId gracefully                        | Mock eventId:undefined. Assert no crash.                         | Renders without error.                 | eventId undefined.                    | Passed  | 11/4/2026 | SangNHT |
| 31  | CP-015            | Handle sessions with empty array                         | Mock sessions:[]. Query "Vui lòng chọn".                         | Message displayed.                     | Empty sessions.                       | Passed  | 11/4/2026 | SangNHT |
| 32  | CP-016            | Handle stats with null summary                           | Mock summary:null, ticketStats:[]. Assert overview present.      | Renders without crash.                 | summary:null.                         | Passed  | 11/4/2026 | SangNHT |
| 33  | CP-017            | Handle ticketStats with null value                       | Mock ticketStats:null. Assert ticket-types-count shows "0".      | Shows 0.                               | ticketStats:null.                     | Passed  | 11/4/2026 | SangNHT |
| 34  | CP-018            | Auto-select first session when sessions load             | Mock 2 sessions. Assert selector value is session-1.             | First session selected.                | Sessions loaded.                      | Passed  | 11/4/2026 | SangNHT |
| 35  | CP-019            | Sync checkInStats from Redux to local state              | Mock stats totalTickets:500. Wait. Assert displayed.             | Correct value displayed.               | Redux stats loaded.                   | Passed  | 11/4/2026 | SangNHT |
| 36  | Realtime Updates  |                                                          |                                                                  |                                        |                                       |         |           |         |
| 37  | CP-020            | Update stats when receiving realtime data                | Mock realtime update to totalTickets:600. Wait. Assert updated.  | Value updates to 600.                  | useCheckInRealtime configured.        | Passed  | 11/4/2026 | SangNHT |

---

## Feature 3: CreateEvent (Organizer)

**Test requirement:** Verify organizer can create a new event, pass correct mode to Step1, and navigate to edit page after creation.

**Integration Test File:** `src/test/integration/Organizer/CreateEventPage.test.tsx`

**Group Labels:** Render, UI Elements, User Interactions, Component Configuration, Edge Cases

| Row | Test Case ID            | Test Case Description                       | Test Case Procedure                                                   | Expected Results                     | Pre-conditions | Round 1 | Test date | Tester  |
| --- | ----------------------- | ------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------ | -------------- | ------- | --------- | ------- |
| 11  | Render                  |                                             |                                                                       |                                      |                |         |           |         |
| 12  | CE-001                  | Render without crashing                     | Render CreateEventPage. Query "Tạo sự kiện mới".                      | Title present.                       | Default mocks. | Passed  | 11/4/2026 | SangNHT |
| 13  | CE-002                  | Render Step1EventInfo component             | Render. Query step1-event-info.                                       | Component present.                   | Default mocks. | Passed  | 11/4/2026 | SangNHT |
| 14  | CE-003                  | Render page title                           | Render. Query page title text.                                        | Title displayed.                     | Default mocks. | Passed  | 11/4/2026 | SangNHT |
| 15  | UI Elements             |                                             |                                                                       |                                      |                |         |           |         |
| 16  | CE-004                  | Pass mode="create" to Step1EventInfo        | Render. Query mode testid. Has "create".                              | Correct mode passed.                 | Default mocks. | Passed  | 11/4/2026 | SangNHT |
| 17  | User Interactions       |                                             |                                                                       |                                      |                |         |           |         |
| 18  | CE-005                  | Navigate to edit page when event is created | Click create button. Assert navigate to edit page with event ID.      | Navigation called with correct path. | Default mocks. | Passed  | 11/4/2026 | SangNHT |
| 19  | CE-006                  | Use correct event ID in navigation          | Mock onCreated with specific ID. Assert navigate called with that ID. | Correct ID in URL.                   | Default mocks. | Passed  | 11/4/2026 | SangNHT |
| 20  | CE-007                  | Pass onCreated callback to Step1EventInfo   | Render. Assert Step1EventInfo receives onCreated prop.                | Callback passed correctly.           | Default mocks. | Passed  | 11/4/2026 | SangNHT |
| 21  | Component Configuration |                                             |                                                                       |                                      |                |         |           |         |
| 22  | CE-008                  | Render with correct layout structure        | Render. Assert parent container has correct classes.                  | Layout classes correct.              | Default mocks. | Passed  | 11/4/2026 | SangNHT |
| 23  | Edge Cases              |                                             |                                                                       |                                      |                |         |           |         |
| 24  | CE-009                  | Handle rapid create clicks                  | Click create button 3 times. Assert navigate called 3 times.          | All clicks handled.                  | Default mocks. | Passed  | 11/4/2026 | SangNHT |
| 25  | CE-010                  | Handle different event IDs from onCreated   | Mock different IDs. Assert each navigates correctly.                  | All IDs handled.                     | Various IDs.   | Passed  | 11/4/2026 | SangNHT |

---

## Feature 4: EditEventWizard (Organizer)

**Test requirement:** Verify organizer can edit event through multi-step wizard (Event Info → Schedule → Settings → Policy), handle rejection/suspension/cancellation banners, and preserve state in localStorage.

**Integration Test File:** `src/test/integration/Organizer/EditEventWizardPage.test.tsx`

**Group Labels:** Render, UI Elements, API Calls, User Interactions, Data Display, Edge Cases

| Row | Test Case ID      | Test Case Description                              | Test Case Procedure                                                   | Expected Results           | Pre-conditions              | Round 1 | Test date | Tester  |
| --- | ----------------- | -------------------------------------------------- | --------------------------------------------------------------------- | -------------------------- | --------------------------- | ------- | --------- | ------- |
| 11  | Render            |                                                    |                                                                       |                            |                             |         |           |         |
| 12  | EW-001            | Render without crashing                            | Render. Query stepper.                                                | Stepper present.           | Default mocks.              | Passed  | 11/4/2026 | SangNHT |
| 13  | EW-002            | Show Step1EventInfo by default                     | Render. Query step1-event-info.                                       | Step1 present.             | Default mocks.              | Passed  | 11/4/2026 | SangNHT |
| 14  | EW-003            | Render stepper component                           | Render. Query stepper and current-step. Has "1".                      | Stepper shows step 1.      | Default mocks.              | Passed  | 11/4/2026 | SangNHT |
| 15  | EW-004            | Pass mode="edit" to Step1EventInfo                 | Render. Query mode. Has "edit".                                       | Correct mode passed.       | Default mocks.              | Passed  | 11/4/2026 | SangNHT |
| 16  | EW-005            | Show rejection reason banner for Draft events      | Mock Draft with publishRejectionReason. Query rejection text.         | Banner displayed.          | Draft event with rejection. | Passed  | 11/4/2026 | SangNHT |
| 17  | EW-006            | Show suspension reason banner for Suspended events | Mock Suspended with suspensionReason. Query suspension text.          | Banner displayed.          | Suspended event.            | Passed  | 11/4/2026 | SangNHT |
| 18  | API Calls         |                                                    |                                                                       |                            |                             |         |           |         |
| 19  | EW-007            | Call fetchMe on mount                              | Render. Assert dispatch called with fetchMe.                          | fetchMe dispatched.        | Default mocks.              | Passed  | 11/4/2026 | SangNHT |
| 20  | EW-008            | Call fetchEventById when eventId is provided       | Render with eventId. Assert dispatch called.                          | fetchEventById dispatched. | eventId provided.           | Passed  | 11/4/2026 | SangNHT |
| 21  | User Interactions |                                                    |                                                                       |                            |                             |         |           |         |
| 22  | EW-009            | Navigate to next step when clicking next button    | Click next button. Assert current-step changes to 2. Step2 present.   | Step 2 displayed.          | Step1 rendered.             | Passed  | 11/4/2026 | SangNHT |
| 23  | EW-010            | Navigate back when clicking back button            | Go to step 2. Click back. Assert step 1.                              | Back to step 1.            | Navigated to step 2.        | Passed  | 11/4/2026 | SangNHT |
| 24  | EW-011            | Navigate through all steps                         | Click next 3 times. Assert steps 2,3,4.                               | All steps reachable.       | Default mocks.              | Passed  | 11/4/2026 | SangNHT |
| 25  | EW-012            | Not go beyond step 4                               | Navigate to step 4. Assert no next button.                            | Cannot go further.         | At step 4.                  | Passed  | 11/4/2026 | SangNHT |
| 26  | Data Display      |                                                    |                                                                       |                            |                             |         |           |         |
| 27  | EW-013            | Display event data in steps                        | Mock event title. Query event-data. Shows title.                      | Event data displayed.      | Event loaded.               | Passed  | 11/4/2026 | SangNHT |
| 28  | EW-014            | Pass event data to all step components             | Mock event title. Query event-data in step.                           | Data passed to step.       | Event loaded.               | Passed  | 11/4/2026 | SangNHT |
| 29  | Edge Cases        |                                                    |                                                                       |                            |                             |         |           |         |
| 30  | EW-015            | Handle missing eventId gracefully                  | Mock eventId:undefined. Assert stepper present.                       | Renders without crash.     | eventId undefined.          | Passed  | 11/4/2026 | SangNHT |
| 31  | EW-016            | Handle event fetch error                           | Mock dispatch reject. Assert stepper present.                         | Renders without crash.     | Fetch fails.                | Passed  | 11/4/2026 | SangNHT |
| 32  | EW-017            | Handle event with cancellation reason              | Mock Cancelled with cancellationReason. Query cancellation text.      | Banner displayed.          | Cancelled event.            | Passed  | 11/4/2026 | SangNHT |
| 33  | EW-018            | Handle event with cancellation rejection reason    | Mock PendingCancellation with rejection reason. Query rejection text. | Banner displayed.          | PendingCancellation event.  | Passed  | 11/4/2026 | SangNHT |
| 34  | EW-019            | Not show any banner for Published events           | Mock Published status. Assert no banners.                             | No banners shown.          | Published event.            | Passed  | 11/4/2026 | SangNHT |
| 35  | EW-020            | Set isAllowUpdate to true for Draft events         | Mock Draft. Query mode has "edit".                                    | Edit mode allowed.         | Draft event.                | Passed  | 11/4/2026 | SangNHT |
| 36  | EW-021            | Set isAllowUpdate to true for Suspended events     | Mock Suspended. Query mode has "edit".                                | Edit mode allowed.         | Suspended event.            | Passed  | 11/4/2026 | SangNHT |
| 37  | EW-022            | Preserve step state in localStorage                | Navigate to step 2. Assert localStorage set.                          | localStorage updated.      | Step navigation.            | Passed  | 11/4/2026 | SangNHT |

---

## Feature 5: EventTicket (Organizer)

**Test requirement:** Verify organizer can view ticket types per session, switch between sessions, toggle between overview and lock-seat tabs, and handle empty ticket states.

**Integration Test File:** `src/test/integration/Organizer/EventTicketPage.test.tsx`

**Group Labels:** Render, UI Elements, API Calls, User Interactions, Data Display, Edge Cases

| Row | Test Case ID      | Test Case Description                                  | Test Case Procedure                                                  | Expected Results                   | Pre-conditions       | Round 1 | Test date | Tester  |
| --- | ----------------- | ------------------------------------------------------ | -------------------------------------------------------------------- | ---------------------------------- | -------------------- | ------- | --------- | ------- |
| 11  | Render            |                                                        |                                                                      |                                    |                      |         |           |         |
| 12  | ET-001            | Render without crashing                                | Render. Query "Suất diễn:".                                          | Label present.                     | Default mocks.       | Passed  | 11/4/2026 | SangNHT |
| 13  | ET-002            | Show loading state initially                           | Mock slow fetch. Query "Suất diễn:".                                 | Renders while loading.             | Slow fetch.          | Passed  | 11/4/2026 | SangNHT |
| 14  | ET-003            | Show overview tab by default                           | Mock ticket types. Query "Tổng quan" and "Khóa ghế".                 | Both tabs present.                 | Default mocks.       | Passed  | 11/4/2026 | SangNHT |
| 15  | UI Elements       |                                                        |                                                                      |                                    |                      |         |           |         |
| 16  | ET-004            | Render session selector dropdown                       | Render. Query combobox.                                              | Select present.                    | Sessions loaded.     | Passed  | 11/4/2026 | SangNHT |
| 17  | ET-005            | Render tab buttons                                     | Render. Query both tab texts.                                        | Tabs present.                      | Default mocks.       | Passed  | 11/4/2026 | SangNHT |
| 18  | ET-006            | Disable session selector when no sessions              | Mock sessions:[]. Assert combobox disabled.                          | Selector disabled.                 | No sessions.         | Passed  | 11/4/2026 | SangNHT |
| 19  | ET-007            | Show "Chua tao ve" message when no ticket types        | Mock ticketTypes:[]. Query message.                                  | Message displayed.                 | No ticket types.     | Passed  | 11/4/2026 | SangNHT |
| 20  | API Calls         |                                                        |                                                                      |                                    |                      |         |           |         |
| 21  | ET-008            | Call fetchEventById on mount                           | Render. Wait. Assert dispatch called.                                | fetchEventById dispatched.         | eventId provided.    | Passed  | 11/4/2026 | SangNHT |
| 22  | ET-009            | Call fetchGetAllTicketTypes when session is selected   | Mock sessions. Wait. Assert dispatch called.                         | fetchGetAllTicketTypes dispatched. | Sessions loaded.     | Passed  | 11/4/2026 | SangNHT |
| 23  | ET-010            | Not call fetchEventById if eventId is undefined        | Mock eventId:undefined. Assert not dispatched.                       | Not dispatched.                    | eventId undefined.   | Passed  | 11/4/2026 | SangNHT |
| 24  | User Interactions |                                                        |                                                                      |                                    |                      |         |           |         |
| 25  | ET-011            | Change session when selecting different option         | Select session-2. Assert value changed.                              | Value is session-2.                | Sessions loaded.     | Passed  | 11/4/2026 | SangNHT |
| 26  | ET-012            | Fetch ticket types when session changes                | Change session. Wait. Assert dispatch with new session.              | Fetch called with new session.     | Sessions loaded.     | Passed  | 11/4/2026 | SangNHT |
| 27  | ET-013            | Switch to lock-seat tab when clicking tab button       | Click "Khóa ghế". Assert lock-seat-tab present.                      | Lock seat tab displayed.           | Default mocks.       | Passed  | 11/4/2026 | SangNHT |
| 28  | ET-014            | Switch back to overview tab when clicking              | Switch to lock-seat, then overview. Assert ticket-type-list present. | Overview displayed.                | Ticket types loaded. | Passed  | 11/4/2026 | SangNHT |
| 29  | Data Display      |                                                        |                                                                      |                                    |                      |         |           |         |
| 30  | ET-015            | Display session titles in dropdown                     | Render. Assert combobox shows first session title.                   | Correct title displayed.           | Sessions loaded.     | Passed  | 11/4/2026 | SangNHT |
| 31  | ET-016            | Display ticket types when available                    | Mock 2 ticket types. Assert 2 items.                                 | Both displayed.                    | 2 ticket types.      | Passed  | 11/4/2026 | SangNHT |
| 32  | ET-017            | Display ticket summary with correct counts             | Mock 3 ticket types. Assert counts.                                  | "3 types" and "3 quantities".      | 3 ticket types.      | Passed  | 11/4/2026 | SangNHT |
| 33  | ET-018            | Show "Khong co suat dien" when sessions array is empty | Mock sessions:[]. Query message.                                     | Message displayed.                 | No sessions.         | Passed  | 11/4/2026 | SangNHT |
| 34  | Edge Cases        |                                                        |                                                                      |                                    |                      |         |           |         |
| 35  | ET-019            | Handle eventId being undefined                         | Mock eventId:undefined. Render.                                      | Renders without crash.             | eventId undefined.   | Passed  | 11/4/2026 | SangNHT |
| 36  | ET-020            | Handle event with null sessions                        | Mock event.sessions:null. Render.                                    | Renders without crash.             | sessions:null.       | Passed  | 11/4/2026 | SangNHT |
| 37  | ET-021            | Handle ticketTypes being null                          | Mock ticketTypes:null. Query "Chưa tạo vé".                          | Empty state displayed.             | ticketTypes:null.    | Passed  | 11/4/2026 | SangNHT |
| 38  | ET-022            | Initialize quantities to zero for each ticket type     | Mock 2 ticket types. Assert quantities count.                        | "2 quantities".                    | 2 ticket types.      | Passed  | 11/4/2026 | SangNHT |
| 39  | ET-023            | Auto-select first session when sessions load           | Mock 2 sessions. Assert selector value session-1.                    | First session selected.            | Sessions loaded.     | Passed  | 11/4/2026 | SangNHT |
| 40  | ET-024            | Handle single session                                  | Mock 1 session. Assert selector value.                               | Correct session selected.          | 1 session.           | Passed  | 11/4/2026 | SangNHT |

---

## Feature 6: Legal (Organizer)

**Test requirement:** Verify organizer can view list of legal terms/policies, navigate to detail, retry on error, and handle empty/error states.

**Integration Test File:** `src/test/integration/Organizer/LegalPage.test.tsx`

**Group Labels:** Render, UI Elements, User Interactions, API Calls, Edge Cases

| Row | Test Case ID      | Test Case Description                         | Test Case Procedure                                  | Expected Results             | Pre-conditions     | Round 1 | Test date | Tester  |
| --- | ----------------- | --------------------------------------------- | ---------------------------------------------------- | ---------------------------- | ------------------ | ------- | --------- | ------- |
| 11  | Render            |                                               |                                                      |                              |                    |         |           |         |
| 12  | LG-001            | Render without crashing                       | Render. Assert skeleton not present.                 | Renders normally.            | Default mocks.     | Passed  | 11/4/2026 | SangNHT |
| 13  | LG-002            | Show empty state when no policies             | Mock list:[]. Query "Chưa có điều khoản nào".        | Empty message displayed.     | Empty list.        | Passed  | 11/4/2026 | SangNHT |
| 14  | LG-003            | Show error state when fetch fails             | Mock error. Query "Không thể tải danh sách".         | Error message displayed.     | Error state.       | Passed  | 11/4/2026 | SangNHT |
| 15  | UI Elements       |                                               |                                                      |                              |                    |         |           |         |
| 16  | LG-004            | Render policy list when available             | Mock 2 policies. Query both descriptions.            | Both policies displayed.     | 2 policies loaded. | Passed  | 11/4/2026 | SangNHT |
| 17  | LG-005            | Render policy type labels                     | Mock policy type:TERMS. Query "TERMS".               | Label displayed.             | Policy with type.  | Passed  | 11/4/2026 | SangNHT |
| 18  | User Interactions |                                               |                                                      |                              |                    |         |           |         |
| 19  | LG-006            | Navigate to legal detail when clicking policy | Mock policy. Click policy. Assert navigate called.   | Navigation to detail.        | Policy loaded.     | Passed  | 11/4/2026 | SangNHT |
| 20  | LG-007            | Retry fetching on error                       | Mock error. Click "Thử lại". Assert dispatch called. | fetchAllPolicies dispatched. | Error state.       | Passed  | 11/4/2026 | SangNHT |
| 21  | API Calls         |                                               |                                                      |                              |                    |         |           |         |
| 22  | LG-008            | Call fetchAllPolicies on mount                | Render. Assert dispatch called.                      | fetchAllPolicies dispatched. | Default mocks.     | Passed  | 11/4/2026 | SangNHT |
| 23  | Edge Cases        |                                               |                                                      |                              |                    |         |           |         |
| 24  | LG-009            | Handle policies with missing fields           | Mock policy with only id. Assert renders.            | Renders without crash.       | Incomplete policy. | Passed  | 11/4/2026 | SangNHT |
| 25  | LG-010            | Update page config on mount                   | Mock setConfig. Assert called with correct title.    | Config updated.              | Default mocks.     | Passed  | 11/4/2026 | SangNHT |

---

## Feature 7: LegalDetail (Organizer)

**Test requirement:** Verify organizer can view policy detail, render DOCX files, download, navigate back, and handle missing/non-DOCX files.

**Integration Test File:** `src/test/integration/Organizer/LegalDetailPage.test.tsx`

**Group Labels:** Render, UI Elements, User Interactions, API Calls, Edge Cases

| Row | Test Case ID      | Test Case Description                          | Test Case Procedure                                          | Expected Results             | Pre-conditions | Round 1 | Test date | Tester  |
| --- | ----------------- | ---------------------------------------------- | ------------------------------------------------------------ | ---------------------------- | -------------- | ------- | --------- | ------- |
| 11  | Render            |                                                |                                                              |                              |                |         |           |         |
| 12  | LD-001            | Render without crashing                        | Mock policy detail. Render. Query "Quay lại".                | Back button present.         | Policy loaded. | Passed  | 11/4/2026 | SangNHT |
| 13  | LD-002            | Show loading skeleton when loading             | Mock loading:true. Query .animate-pulse.                     | Skeleton present.            | Loading state. | Passed  | 11/4/2026 | SangNHT |
| 14  | LD-003            | Show not found state when policy is missing    | Mock detail:null. Query "Không tìm thấy điều khoản".         | Not found message displayed. | No policy.     | Passed  | 11/4/2026 | SangNHT |
| 15  | LD-004            | Show error state when fetch fails              | Mock error. Query "Không tìm thấy điều khoản".               | Error message displayed.     | Error state.   | Passed  | 11/4/2026 | SangNHT |
| 16  | UI Elements       |                                                |                                                              |                              |                |         |           |         |
| 17  | LD-005            | Render policy description in title when loaded | Mock policy with description. Wait. Assert setConfig called. | Config updated with title.   | Policy loaded. | Passed  | 11/4/2026 | SangNHT |
| 18  | LD-006            | Render download button                         | Mock policy. Query "Tải xuống".                              | Button present.              | Policy loaded. | Passed  | 11/4/2026 | SangNHT |
| 19  | LD-007            | Render search button                           | Mock policy. Query "Tìm kiếm".                               | Button present.              | Policy loaded. | Passed  | 11/4/2026 | SangNHT |
| 20  | User Interactions |                                                |                                                              |                              |                |         |           |         |
| 21  | LD-008            | Navigate back when clicking back button        | Mock navigate fn. Click back. Assert navigate(-1).           | Navigation called.           | Policy loaded. | Passed  | 11/4/2026 | SangNHT |
| 22  | LD-009            | Navigate back from error state                 | Mock error, navigate fn. Click back. Assert navigate(-1).    | Navigation called.           | Error state.   | Passed  | 11/4/2026 | SangNHT |
| 23  | API Calls         |                                                |                                                              |                              |                |         |           |         |
| 24  | LD-010            | Call fetchPolicyById on mount                  | Render. Assert dispatch called with policy ID.               | fetchPolicyById dispatched.  | Default mocks. | Passed  | 11/4/2026 | SangNHT |
| 25  | LD-011            | Not call fetchPolicyById if id is missing      | Mock id:undefined. Assert not dispatched.                    | Not dispatched.              | id undefined.  | Passed  | 11/4/2026 | SangNHT |
| 26  | Edge Cases        |                                                |                                                              |                              |                |         |           |         |
| 27  | LD-012            | Handle missing policy id gracefully            | Mock id:undefined. Render. Query "Quay lại".                 | Renders without crash.       | id undefined.  | Passed  | 11/4/2026 | SangNHT |
| 28  | LD-013            | Handle policy without fileUrl                  | Mock fileUrl:null. Query "Đang chuẩn bị tài liệu".           | Viewer message displayed.    | fileUrl:null.  | Passed  | 11/4/2026 | SangNHT |
| 29  | LD-014            | Handle non-docx files                          | Mock fileUrl:.pdf. Query "Không thể hiển thị tài liệu".      | Error message displayed.     | PDF file.      | Passed  | 11/4/2026 | SangNHT |
| 30  | LD-015            | Update page config with policy description     | Mock setConfig. Wait. Assert called with title.              | Config updated.              | Policy loaded. | Passed  | 11/4/2026 | SangNHT |
| 31  | LD-016            | Handle fetch error for docx file               | Mock fetch 404. Query "Không tải được file".                 | Error message displayed.     | Fetch fails.   | Passed  | 11/4/2026 | SangNHT |

---

## Feature 8: Marketing (Organizer)

**Test requirement:** Verify organizer can view marketing performance chart, AI prompt form, and marketing table.

**Integration Test File:** `src/test/integration/Organizer/MarketingPage.test.tsx`

**Group Labels:** Render, UI Elements, Layout

| Row | Test Case ID | Test Case Description                 | Test Case Procedure                        | Expected Results      | Pre-conditions | Round 1 | Test date | Tester  |
| --- | ------------ | ------------------------------------- | ------------------------------------------ | --------------------- | -------------- | ------- | --------- | ------- |
| 11  | Render       |                                       |                                            |                       |                |         |           |         |
| 12  | MK-001       | Render without crashing               | Render. Query marketing-performance-chart. | Chart present.        | Default mocks. | Passed  | 11/4/2026 | SangNHT |
| 13  | UI Elements  |                                       |                                            |                       |                |         |           |         |
| 14  | MK-002       | Render all main sections              | Render. Query all 3 testids.               | All sections present. | Default mocks. | Passed  | 11/4/2026 | SangNHT |
| 15  | MK-003       | Render section title                  | Render. Query "Tạo nội dung mới với AI".   | Title displayed.      | Default mocks. | Passed  | 11/4/2026 | SangNHT |
| 16  | Layout       |                                       |                                            |                       |                |         |           |         |
| 17  | MK-004       | Render with correct container classes | Render. Assert parent has correct classes. | Classes present.      | Default mocks. | Passed  | 11/4/2026 | SangNHT |

---

## Feature 9: MarketingDetail (Organizer)

**Test requirement:** Verify organizer can view marketing post detail, see Facebook metrics, reload data, and handle error/missing states.

**Integration Test File:** `src/test/integration/Organizer/MarketingDetailPage.test.tsx`

**Group Labels:** Render, API Calls, User Interactions, Data Display, Edge Cases

| Row | Test Case ID      | Test Case Description                              | Test Case Procedure                                    | Expected Results                  | Pre-conditions | Round 1 | Test date | Tester  |
| --- | ----------------- | -------------------------------------------------- | ------------------------------------------------------ | --------------------------------- | -------------- | ------- | --------- | ------- |
| 11  | Render            |                                                    |                                                        |                                   |                |         |           |         |
| 12  | MD-001            | Render without crashing                            | Render. Query content-detail.                          | Component present.                | Default mocks. | Passed  | 11/4/2026 | SangNHT |
| 13  | MD-002            | Show loading state                                 | Mock loading:true. Query loading testid "true".        | Loading displayed.                | Loading state. | Passed  | 11/4/2026 | SangNHT |
| 14  | API Calls         |                                                    |                                                        |                                   |                |         |           |         |
| 15  | MD-003            | Show Facebook metrics when post is loaded          | Mock postDetail. Query facebook-metrics.               | Metrics present.                  | Post loaded.   | Passed  | 11/4/2026 | SangNHT |
| 16  | MD-004            | Call fetchPostDetail on mount                      | Render. Assert dispatch called with marketingId.       | fetchPostDetail dispatched.       | Default mocks. | Passed  | 11/4/2026 | SangNHT |
| 17  | MD-005            | Not call fetchPostDetail if marketingId is missing | Mock marketingId:undefined. Assert not dispatched.     | Not dispatched.                   | id undefined.  | Passed  | 11/4/2026 | SangNHT |
| 18  | User Interactions |                                                    |                                                        |                                   |                |         |           |         |
| 19  | MD-006            | Reload data when clicking reload button            | Mock postDetail. Click reload. Assert dispatch called. | fetchPostDetail dispatched again. | Post loaded.   | Passed  | 11/4/2026 | SangNHT |
| 20  | Data Display      |                                                    |                                                        |                                   |                |         |           |         |
| 21  | MD-007            | Pass post detail to child components               | Mock postDetail. Query post-title and metrics-post-id. | Both show correct data.           | Post loaded.   | Passed  | 11/4/2026 | SangNHT |
| 22  | Edge Cases        |                                                    |                                                        |                                   |                |         |           |         |
| 23  | MD-008            | Handle error state                                 | Mock error. Query error testid.                        | Error displayed.                  | Error state.   | Passed  | 11/4/2026 | SangNHT |
| 24  | MD-009            | Handle missing marketingId                         | Mock id:undefined. Query content-detail.               | Renders without crash.            | id undefined.  | Passed  | 11/4/2026 | SangNHT |

---

## Feature 10: MemberManagement (Organizer)

**Test requirement:** Verify organizer can manage event members: search, filter, paginate, add with validation, export Excel, and handle edge cases.

**Integration Test File:** `src/test/integration/Organizer/MemberManagementPage.test.tsx`

**Group Labels:** Render, UI Elements, API Calls, User Interactions, Data Display, Edge Cases

| Row | Test Case ID      | Test Case Description                                  | Test Case Procedure                                                | Expected Results                   | Pre-conditions           | Round 1 | Test date | Tester  |
| --- | ----------------- | ------------------------------------------------------ | ------------------------------------------------------------------ | ---------------------------------- | ------------------------ | ------- | --------- | ------- |
| 11  | Render            |                                                        |                                                                    |                                    |                          |         |           |         |
| 12  | MM-001            | Render without crashing                                | Render. Query "Quản lý thành viên".                                | Title present.                     | Default mocks.           | Passed  | 11/4/2026 | SangNHT |
| 13  | MM-002            | Render null when eventId is missing                    | Mock eventId:undefined. Assert container empty.                    | Empty output.                      | eventId undefined.       | Passed  | 11/4/2026 | SangNHT |
| 14  | MM-003            | Show member count badge                                | Mock 2 members. Query "Thành viên".                                | Badge present.                     | Members loaded.          | Passed  | 11/4/2026 | SangNHT |
| 15  | UI Elements       |                                                        |                                                                    |                                    |                          |         |           |         |
| 16  | MM-004            | Render search input                                    | Render. Query placeholder.                                         | Input present.                     | Default mocks.           | Passed  | 11/4/2026 | SangNHT |
| 17  | MM-005            | Render export Excel button                             | Render. Query "Xuất Excel".                                        | Button present.                    | Default mocks.           | Passed  | 11/4/2026 | SangNHT |
| 18  | MM-006            | Render add member button                               | Render. Query "+ Thêm thành viên".                                 | Button present.                    | Default mocks.           | Passed  | 11/4/2026 | SangNHT |
| 19  | MM-007            | Render members table                                   | Render. Query members-table.                                       | Table present.                     | Default mocks.           | Passed  | 11/4/2026 | SangNHT |
| 20  | MM-008            | Render pagination                                      | Render. Query pagination.                                          | Pagination present.                | Default mocks.           | Passed  | 11/4/2026 | SangNHT |
| 21  | API Calls         |                                                        |                                                                    |                                    |                          |         |           |         |
| 22  | MM-009            | Show add modal when clicking add button                | Click add button. Query "Thêm thành viên mới".                     | Modal displayed.                   | Default mocks.           | Passed  | 11/4/2026 | SangNHT |
| 23  | MM-010            | Call fetchEventMembers on mount                        | Render. Wait. Assert dispatch called.                              | fetchEventMembers dispatched.      | eventId provided.        | Passed  | 11/4/2026 | SangNHT |
| 24  | MM-011            | Call fetchAddEventMember when adding member            | Open modal, fill email, submit. Wait. Assert dispatch.             | fetchAddEventMember dispatched.    | Modal open, form filled. | Passed  | 11/4/2026 | SangNHT |
| 25  | MM-012            | Call fetchExportExcelMember when clicking export       | Mock blob. Click export. Wait. Assert dispatch.                    | fetchExportExcelMember dispatched. | Default mocks.           | Passed  | 11/4/2026 | SangNHT |
| 26  | User Interactions |                                                        |                                                                    |                                    |                          |         |           |         |
| 27  | MM-013            | Filter members when typing in search                   | Mock 2 members. Type "alice" in search. Wait. Assert 1 filtered.   | Filter count correct.              | Members loaded.          | Passed  | 11/4/2026 | SangNHT |
| 28  | MM-014            | Toggle permissions in add modal                        | Open modal. Click "Check-in" twice.                                | Toggle works.                      | Modal open.              | Passed  | 11/4/2026 | SangNHT |
| 29  | MM-015            | Close add modal when clicking cancel                   | Open modal. Click "Hủy". Assert modal removed.                     | Modal closed.                      | Modal open.              | Passed  | 11/4/2026 | SangNHT |
| 30  | MM-016            | Close add modal when submit succeeds                   | Open modal, fill, submit. Wait. Assert modal removed.              | Modal closed after success.        | Modal open.              | Passed  | 11/4/2026 | SangNHT |
| 31  | MM-017            | Validate email format in add modal                     | Open modal. Type "invalid-email". Submit. Query error.             | Error displayed.                   | Modal open.              | Passed  | 11/4/2026 | SangNHT |
| 32  | MM-018            | Show error for empty email                             | Open modal. Submit without email. Query error.                     | Error displayed.                   | Modal open.              | Passed  | 11/4/2026 | SangNHT |
| 33  | MM-019            | Show error for duplicate email                         | Mock existing member. Open modal. Type same email. Submit.         | Duplicate error displayed.         | Modal open.              | Passed  | 11/4/2026 | SangNHT |
| 34  | MM-020            | Show warning for non-existent user (404)               | Mock 404 rejection. Submit. Assert notify.warning.                 | Warning notification shown.        | Modal open.              | Passed  | 11/4/2026 | SangNHT |
| 35  | MM-021            | Reset form after successful add                        | Open modal, fill, submit. Wait. Assert modal removed.              | Form reset.                        | Modal open.              | Passed  | 11/4/2026 | SangNHT |
| 36  | MM-022            | Paginate through members                               | Mock 25 members. Click page-next. Assert page 2.                   | Page changes.                      | Members loaded.          | Passed  | 11/4/2026 | SangNHT |
| 37  | Data Display      |                                                        |                                                                    |                                    |                          |         |           |         |
| 38  | MM-023            | Display members correctly                              | Mock 2 members. Assert "2 members".                                | Count correct.                     | Members loaded.          | Passed  | 11/4/2026 | SangNHT |
| 39  | MM-024            | Paginate members with page size 10                     | Mock 15 members. Assert total-pages "2".                           | 2 pages.                           | 15 members.              | Passed  | 11/4/2026 | SangNHT |
| 40  | Edge Cases        |                                                        |                                                                    |                                    |                          |         |           |         |
| 41  | MM-025            | Show empty filtered count when no members match search | Mock 1 member. Search "nonexistent". Assert "0 filtered".          | Zero filtered.                     | Member loaded.           | Passed  | 11/4/2026 | SangNHT |
| 42  | MM-026            | Handle members with no email                           | Mock member email:null. Assert count "1".                          | Renders without crash.             | Member loaded.           | Passed  | 11/4/2026 | SangNHT |
| 43  | MM-027            | Handle adding member with loading state                | Mock addingMember:true. Open modal. Assert button disabled.        | Submit button disabled.            | addingMember:true.       | Passed  | 11/4/2026 | SangNHT |
| 44  | MM-028            | Reset page to 1 when search changes                    | Mock 25 members. Go to page 2. Type search. Assert page 1.         | Page reset.                        | Members loaded.          | Passed  | 11/4/2026 | SangNHT |
| 45  | MM-029            | Adjust page when filtered results have fewer pages     | Mock 25 members. Go to page 3. Filter to 5 results. Assert page 1. | Page adjusted.                     | Members loaded.          | Passed  | 11/4/2026 | SangNHT |
| 46  | MM-030            | Handle export failure                                  | Mock dispatch reject. Click export. Assert notify.error.           | Error notification shown.          | Default mocks.           | Passed  | 11/4/2026 | SangNHT |
| 47  | MM-031            | Handle case-insensitive email search                   | Mock "Alice@Example.com". Search "ALICE". Assert 1 filtered.       | Case-insensitive match.            | Members loaded.          | Passed  | 11/4/2026 | SangNHT |

---

---

## Feature 11: MyEvents (Organizer)

**Test requirement:** Verify organizer can view events list, search, filter by status, paginate, and handle role-based behavior (Organizer vs Member).

**Integration Test File:** `src/test/integration/Organizer/MyEventsPage.test.tsx`

**Group Labels:** Render, UI Elements, API Calls, User Interactions, Data Display, Edge Cases, Role-based Behavior

| Row | Test Case ID        | Test Case Description                                                    | Test Case Procedure                                                          | Expected Results                                 | Pre-conditions   | Round 1 | Test date | Tester  |
| --- | ------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------- | ------------------------------------------------ | ---------------- | ------- | --------- | ------- |
| 11  | Render              |                                                                          |                                                                              |                                                  |                  |         |           |         |
| 12  | ME-001              | Render without crashing for organizer role                               | Mock Organizer role. Query search-bar.                                       | Search bar present.                              | Organizer role.  | Passed  | 11/4/2026 | SangNHT |
| 13  | ME-002              | Render without crashing for member role                                  | Mock Member role. Query search-bar.                                          | Search bar present.                              | Member role.     | Passed  | 11/4/2026 | SangNHT |
| 14  | ME-003              | Show loading state while role is not resolved                            | Mock currentInfor:null. Query skeletons.                                     | Skeletons present.                               | Role not loaded. | Passed  | 11/4/2026 | SangNHT |
| 15  | UI Elements         |                                                                          |                                                                              |                                                  |                  |         |           |         |
| 16  | ME-004              | Render search bar with correct placeholder for organizer                 | Mock Organizer. Query search-bar placeholder.                                | Correct placeholder.                             | Organizer role.  | Passed  | 11/4/2026 | SangNHT |
| 17  | ME-005              | Render search bar with correct placeholder for member                    | Mock Member. Query search-bar placeholder.                                   | Correct placeholder.                             | Member role.     | Passed  | 11/4/2026 | SangNHT |
| 18  | ME-006              | Render status filters for organizer only                                 | Mock Organizer. Query status-filters.                                        | Filters present.                                 | Organizer role.  | Passed  | 11/4/2026 | SangNHT |
| 19  | ME-007              | NOT render status filters for member                                     | Mock Member. Assert status-filters absent.                                   | Filters absent.                                  | Member role.     | Passed  | 11/4/2026 | SangNHT |
| 20  | ME-008              | Render pagination for organizer                                          | Mock Organizer, pagination data. Query pagination.                           | Pagination present.                              | Organizer role.  | Passed  | 11/4/2026 | SangNHT |
| 21  | ME-009              | NOT render pagination for member                                         | Mock Member. Assert pagination absent.                                       | Pagination absent.                               | Member role.     | Passed  | 11/4/2026 | SangNHT |
| 22  | API Calls           |                                                                          |                                                                              |                                                  |                  |         |           |         |
| 23  | ME-010              | Call fetchMe on mount                                                    | Render. Assert dispatch called.                                              | fetchMe dispatched.                              | Default mocks.   | Passed  | 11/4/2026 | SangNHT |
| 24  | ME-011              | Call fetchAllEventsByMe for organizer after role resolved                | Mock Organizer. Wait. Assert dispatch.                                       | fetchAllEventsByMe dispatched.                   | Organizer role.  | Passed  | 11/4/2026 | SangNHT |
| 25  | ME-012              | Call fetchEventListAssignedForCurrentUser for member after role resolved | Mock Member. Wait. Assert dispatch.                                          | fetchEventListAssignedForCurrentUser dispatched. | Member role.     | Passed  | 11/4/2026 | SangNHT |
| 26  | User Interactions   |                                                                          |                                                                              |                                                  |                  |         |           |         |
| 27  | ME-013              | Update search query when typing in search bar                            | Type in search bar. Assert value.                                            | Value updated.                                   | Organizer role.  | Passed  | 11/4/2026 | SangNHT |
| 28  | ME-014              | Reset page to 1 when search query changes                                | Type search. Wait debounce.                                                  | Internal state updated.                          | Organizer role.  | Passed  | 11/4/2026 | SangNHT |
| 29  | ME-015              | Change status filter and reset page for organizer                        | Mock Organizer. Click upcoming filter. Wait. Assert dispatch with published. | fetchAllEventsByMe with published.               | Organizer role.  | Passed  | 11/4/2026 | SangNHT |
| 30  | ME-016              | Change page when clicking pagination                                     | Mock Organizer, pagination. Click page-2. Wait. Assert dispatch.             | fetchAllEventsByMe with page 2.                  | Organizer role.  | Passed  | 11/4/2026 | SangNHT |
| 31  | Data Display        |                                                                          |                                                                              |                                                  |                  |         |           |         |
| 32  | ME-017              | Display organizer events correctly                                       | Mock Organizer, 1 event. Query event title and location.                     | Event data displayed.                            | Organizer role.  | Passed  | 11/4/2026 | SangNHT |
| 33  | ME-018              | Display member events correctly                                          | Mock Member, 1 assigned event. Query title. Assert is-member attr.           | Event data displayed with member flag.           | Member role.     | Passed  | 11/4/2026 | SangNHT |
| 34  | ME-019              | Show empty state when no events found                                    | Mock Organizer, empty events. Query "Không có sự kiện nào".                  | Empty message displayed.                         | Organizer role.  | Passed  | 11/4/2026 | SangNHT |
| 35  | ME-020              | Filter events based on search query                                      | Mock 2 events. Search "React". Wait. Assert 1 card.                          | Only matching event shown.                       | Organizer role.  | Passed  | 11/4/2026 | SangNHT |
| 36  | ME-021              | Show loading skeleton while fetching organizer events                    | Mock Organizer, slow dispatch. Query skeletons.                              | Skeletons present.                               | Slow fetch.      | Passed  | 11/4/2026 | SangNHT |
| 37  | ME-022              | Show loading skeleton while fetching member events                       | Mock Member, fetching:true. Query skeletons.                                 | Skeletons present.                               | Slow fetch.      | Passed  | 11/4/2026 | SangNHT |
| 38  | Edge Cases          |                                                                          |                                                                              |                                                  |                  |         |           |         |
| 39  | ME-023              | Handle events with null dates                                            | Mock event startAt:null, endAt:null. Query time. Shows "Chưa có thời gian".  | Fallback time displayed.                         | Event loaded.    | Passed  | 11/4/2026 | SangNHT |
| 40  | ME-024              | Handle events with only start date                                       | Mock event with only startAt. Query time. Shows "Từ".                        | Start time displayed.                            | Event loaded.    | Passed  | 11/4/2026 | SangNHT |
| 41  | ME-025              | Handle events with only end date                                         | Mock event with only endAt. Query time. Shows "Đến".                         | End time displayed.                              | Event loaded.    | Passed  | 11/4/2026 | SangNHT |
| 42  | ME-026              | Handle rejection reasons for Draft events                                | Mock Draft with rejection reason. Query event title.                         | Event displayed.                                 | Draft event.     | Passed  | 11/4/2026 | SangNHT |
| 43  | ME-027              | Handle member events with no sessions                                    | Mock Member, sessions:null. Query title.                                     | Event displayed.                                 | Member role.     | Passed  | 11/4/2026 | SangNHT |
| 44  | ME-028              | Handle user with multiple roles including Organizer                      | Mock roles:[Member,Organizer,Admin]. Query status-filters and pagination.    | Both present (treated as Organizer).             | Multiple roles.  | Passed  | 11/4/2026 | SangNHT |
| 45  | ME-029              | Handle user with no roles                                                | Mock roles:[]. Assert no filters/pagination.                                 | Treated as Member.                               | No roles.        | Passed  | 11/4/2026 | SangNHT |
| 46  | ME-030              | Handle user with undefined roles                                         | Mock currentInfor:{} without roles. Assert no filters.                       | Treated as Member.                               | No roles.        | Passed  | 11/4/2026 | SangNHT |
| 47  | Role-based Behavior |                                                                          |                                                                              |                                                  |                  |         |           |         |
| 48  | ME-031              | Fetch organizer data when user has Organizer role                        | Mock Organizer. Wait. Assert fetchAllEventsByMe called.                      | Data fetched.                                    | Organizer role.  | Passed  | 11/4/2026 | SangNHT |
| 49  | ME-032              | Fetch member data when user does not have Organizer role                 | Mock Member. Wait. Assert fetchEventListAssigned called.                     | Data fetched.                                    | Member role.     | Passed  | 11/4/2026 | SangNHT |
| 50  | ME-033              | Update page config with correct title for organizer                      | Mock Organizer. Assert setConfig with "Sự kiện của tôi".                     | Config updated.                                  | Organizer role.  | Passed  | 11/4/2026 | SangNHT |
| 51  | ME-034              | Update page config with correct title for member                         | Mock Member. Assert setConfig with "Sự kiện được phân công".                 | Config updated.                                  | Member role.     | Passed  | 11/4/2026 | SangNHT |

---

## Feature 12: OrderList (Organizer)

**Test requirement:** Verify organizer can view order list for an event, handle missing eventId, and display correct event ID from URL params.

**Integration Test File:** `src/test/integration/Organizer/OrderListPage.test.tsx`

**Group Labels:** Render, UI Elements, Data Display, Edge Cases, Route Params

| Row | Test Case ID | Test Case Description                                 | Test Case Procedure                                       | Expected Results               | Pre-conditions     | Round 1 | Test date | Tester  |
| --- | ------------ | ----------------------------------------------------- | --------------------------------------------------------- | ------------------------------ | ------------------ | ------- | --------- | ------- |
| 11  | Render       |                                                       |                                                           |                                |                    |         |           |         |
| 12  | OL-001       | Render OrderList component when eventId is provided   | Mock eventId. Render. Query order-list.                   | Order list present.            | eventId provided.  | Passed  | 11/4/2026 | SangNHT |
| 13  | OL-002       | Show error message when eventId is not provided       | Mock eventId:undefined. Query "Không tìm thấy sự kiện".   | Error displayed.               | eventId undefined. | Passed  | 11/4/2026 | SangNHT |
| 14  | OL-003       | Show error message when eventId is empty string       | Mock eventId:"". Query error message.                     | Error displayed.               | Empty eventId.     | Passed  | 11/4/2026 | SangNHT |
| 15  | UI Elements  |                                                       |                                                           |                                |                    |         |           |         |
| 16  | OL-004       | Pass eventId to OrderList component                   | Mock eventId. Query event-id testid.                      | Correct ID displayed.          | eventId provided.  | Passed  | 11/4/2026 | SangNHT |
| 17  | OL-005       | Render OrderList with correct eventId from URL params | Mock eventId. Render. Query event-id.                     | Correct ID.                    | eventId provided.  | Passed  | 11/4/2026 | SangNHT |
| 18  | Data Display |                                                       |                                                           |                                |                    |         |           |         |
| 19  | OL-006       | Handle null eventId gracefully                        | Mock eventId:null. Query error.                           | Error displayed.               | eventId null.      | Passed  | 11/4/2026 | SangNHT |
| 20  | OL-007       | Handle different eventId formats                      | Test multiple ID formats. Assert each rendered.           | All formats handled.           | Various IDs.       | Passed  | 11/4/2026 | SangNHT |
| 21  | Edge Cases   |                                                       |                                                           |                                |                    |         |           |         |
| 22  | OL-008       | Render error state with correct styling               | Mock eventId:undefined. Assert error has correct classes. | Correct styling.               | eventId undefined. | Passed  | 11/4/2026 | SangNHT |
| 23  | Route Params |                                                       |                                                           |                                |                    |         |           |         |
| 24  | OL-009       | Use useParams to get eventId                          | Mock eventId. Assert eventId from params.                 | Correct param used.            | Default mocks.     | Passed  | 11/4/2026 | SangNHT |
| 25  | OL-010       | Conditionally render based on eventId presence        | Render with eventId then without. Assert both states.     | Correct conditional rendering. | Both states.       | Passed  | 11/4/2026 | SangNHT |

---

## Feature 13: OrganizerAccount (Organizer)

**Test requirement:** Verify organizer can view/update profile information, manage bank account, handle different status banners, and validate forms.

**Integration Test File:** `src/test/integration/Organizer/OrganizerAccountPage.test.tsx`

**Group Labels:** Render, Tab Navigation, Location State, Form Validation, API Calls, Status Banner, Edge Cases

| Row | Test Case ID    | Test Case Description                                            | Test Case Procedure                                      | Expected Results          | Pre-conditions   | Round 1 | Test date | Tester  |
| --- | --------------- | ---------------------------------------------------------------- | -------------------------------------------------------- | ------------------------- | ---------------- | ------- | --------- | ------- |
| 11  | Render          |                                                                  |                                                          |                           |                  |         |           |         |
| 12  | OA-001          | Render without crashing                                          | Render. Assert setConfig called.                         | Config updated.           | Default mocks.   | Passed  | 11/4/2026 | SangNHT |
| 13  | OA-002          | Render profile fields when loaded                                | Render. Query display value.                             | Profile value displayed.  | Profile loaded.  | Passed  | 11/4/2026 | SangNHT |
| 14  | OA-003          | Render bank fields when loaded                                   | Click bank tab. Query bank-select.                       | Bank fields present.      | Profile loaded.  | Passed  | 11/4/2026 | SangNHT |
| 15  | Tab Navigation  |                                                                  |                                                          |                           |                  |         |           |         |
| 16  | OA-004          | Render tabs for navigation                                       | Render. Query both tab texts.                            | Both tabs present.        | Default mocks.   | Passed  | 11/4/2026 | SangNHT |
| 17  | OA-005          | Show profile tab by default                                      | Render. Query profile tab text.                          | Profile tab active.       | Default mocks.   | Passed  | 11/4/2026 | SangNHT |
| 18  | OA-006          | Switch to bank tab when clicked                                  | Click bank tab. Query bank-select.                       | Bank tab active.          | Default mocks.   | Passed  | 11/4/2026 | SangNHT |
| 19  | Location State  |                                                                  |                                                          |                           |                  |         |           |         |
| 20  | OA-007          | Set active tab from location state                               | Mock location state tab:bank. Render. Query bank-select. | Bank tab active.          | Location state.  | Passed  | 11/4/2026 | SangNHT |
| 21  | OA-008          | Set errors from missing fields in location state                 | Mock missingFields. Render.                              | Component renders.        | Location state.  | Passed  | 11/4/2026 | SangNHT |
| 22  | Form Validation |                                                                  |                                                          |                           |                  |         |           |         |
| 23  | OA-009          | Validate profile fields on save                                  | Render with profile. Query display value.                | Valid data displayed.     | Profile loaded.  | Passed  | 11/4/2026 | SangNHT |
| 24  | OA-010          | Validate bank fields on save                                     | Click bank tab. Query bank-input value.                  | Bank value displayed.     | Profile loaded.  | Passed  | 11/4/2026 | SangNHT |
| 25  | API Calls       |                                                                  |                                                          |                           |                  |         |           |         |
| 26  | OA-011          | Call fetchMe on mount                                            | Render. Assert dispatch called.                          | fetchMe dispatched.       | Default mocks.   | Passed  | 11/4/2026 | SangNHT |
| 27  | OA-012          | Call fetchGetOrganizerProfileDetailById when userId is available | Render. Wait. Assert dispatch with userId.               | Profile fetch dispatched. | Profile loaded.  | Passed  | 11/4/2026 | SangNHT |
| 28  | Status Banner   |                                                                  |                                                          |                           |                  |         |           |         |
| 29  | OA-013          | Show verified status banner                                      | Render with Verified status.                             | Banner displayed.         | Verified status. | Passed  | 11/4/2026 | SangNHT |
| 30  | OA-014          | Show draft status banner                                         | Render with Draft status.                                | Banner displayed.         | Draft status.    | Passed  | 11/4/2026 | SangNHT |
| 31  | OA-015          | Show pending status banner                                       | Render with Pending status.                              | Banner displayed.         | Pending status.  | Passed  | 11/4/2026 | SangNHT |
| 32  | OA-016          | Show rejected status banner                                      | Render with Rejected status.                             | Banner displayed.         | Rejected status. | Passed  | 11/4/2026 | SangNHT |
| 33  | Edge Cases      |                                                                  |                                                          |                           |                  |         |           |         |
| 34  | OA-017          | Handle null profileDetail                                        | Mock profileDetail:null. Assert container present.       | Renders without crash.    | null profile.    | Passed  | 11/4/2026 | SangNHT |
| 35  | OA-018          | Handle missing auth info                                         | Mock currentInfor:null. Assert container present.        | Renders without crash.    | No auth.         | Passed  | 11/4/2026 | SangNHT |
| 36  | OA-019          | Handle empty roles                                               | Mock roles:[]. Assert container present.                 | Renders without crash.    | Empty roles.     | Passed  | 11/4/2026 | SangNHT |
| 37  | OA-020          | Handle company business type                                     | Mock businessType:Company. Assert container present.     | Renders without crash.    | Company type.    | Passed  | 11/4/2026 | SangNHT |

---

## Feature 14: OrganizerOverviewAll (Organizer)

**Test requirement:** Verify organizer can view overall dashboard with revenue cards, charts, trend period selection, and handle edge cases.

**Integration Test File:** `src/test/integration/Organizer/OrganizerOverviewAllPage.test.tsx`

**Group Labels:** Render, Data Display, User Interactions, API Calls, Loading States, Edge Cases

| Row | Test Case ID      | Test Case Description                                    | Test Case Procedure                             | Expected Results                    | Pre-conditions   | Round 1 | Test date | Tester  |
| --- | ----------------- | -------------------------------------------------------- | ----------------------------------------------- | ----------------------------------- | ---------------- | ------- | --------- | ------- |
| 11  | Render            |                                                          |                                                 |                                     |                  |         |           |         |
| 12  | OO-001            | Render without crashing                                  | Render. Query title.                            | Title present.                      | Default mocks.   | Passed  | 11/4/2026 | SangNHT |
| 13  | OO-002            | Render metric cards                                      | Render. Query all metric labels.                | All cards present.                  | Default mocks.   | Passed  | 11/4/2026 | SangNHT |
| 14  | OO-003            | Render chart sections                                    | Render. Query chart section titles.             | Charts present.                     | Default mocks.   | Passed  | 11/4/2026 | SangNHT |
| 15  | OO-004            | Render trend period buttons                              | Render. Query all 3 period buttons.             | All buttons present.                | Default mocks.   | Passed  | 11/4/2026 | SangNHT |
| 16  | Data Display      |                                                          |                                                 |                                     |                  |         |           |         |
| 17  | OO-005            | Display formatted revenue values                         | Render. Query formatted revenue text.           | Correct format displayed.           | Default mocks.   | Passed  | 11/4/2026 | SangNHT |
| 18  | OO-006            | Display event counts                                     | Render. Query event count.                      | Count displayed.                    | Default mocks.   | Passed  | 11/4/2026 | SangNHT |
| 19  | OO-007            | Display refund rate                                      | Render. Query refund rate text.                 | Rate displayed.                     | Default mocks.   | Passed  | 11/4/2026 | SangNHT |
| 20  | User Interactions |                                                          |                                                 |                                     |                  |         |           |         |
| 21  | OO-008            | Change trend period when clicking button                 | Click "6 tháng". Wait. Assert dispatch.         | fetchAllEventSalesTrend dispatched. | Default mocks.   | Passed  | 11/4/2026 | SangNHT |
| 22  | API Calls         |                                                          |                                                 |                                     |                  |         |           |         |
| 23  | OO-009            | Call fetchOrganizerProfile on mount                      | Render. Assert dispatch called.                 | fetchOrganizerProfile dispatched.   | Default mocks.   | Passed  | 11/4/2026 | SangNHT |
| 24  | OO-010            | Call fetchRevenueSummaryOrganizer when profile is loaded | Render. Wait. Assert dispatch with userId.      | Summary fetch dispatched.           | Profile loaded.  | Passed  | 11/4/2026 | SangNHT |
| 25  | OO-011            | Call fetchAllEventSalesTrend on mount                    | Render. Wait. Assert dispatch.                  | Trend fetch dispatched.             | Default mocks.   | Passed  | 11/4/2026 | SangNHT |
| 26  | Loading States    |                                                          |                                                 |                                     |                  |         |           |         |
| 27  | OO-012            | Show skeleton when summary is loading                    | Mock summary loading:true. Query skeletons.     | Skeletons present.                  | Loading state.   | Passed  | 11/4/2026 | SangNHT |
| 28  | OO-013            | Show skeleton when breakdown is loading                  | Mock breakdown loading:true. Query skeletons.   | Skeletons present.                  | Loading state.   | Passed  | 11/4/2026 | SangNHT |
| 29  | OO-014            | Show skeleton when trend is loading                      | Mock trend loading:true. Query skeletons.       | Skeletons present.                  | Loading state.   | Passed  | 11/4/2026 | SangNHT |
| 30  | Edge Cases        |                                                          |                                                 |                                     |                  |         |           |         |
| 31  | OO-015            | Handle null profile                                      | Mock profile:null. Assert container present.    | Renders without crash.              | null profile.    | Passed  | 11/4/2026 | SangNHT |
| 32  | OO-016            | Handle empty revenue data                                | Mock all zeros. Query "0".                      | Zeros displayed.                    | Empty data.      | Passed  | 11/4/2026 | SangNHT |
| 33  | OO-017            | Handle empty breakdown array                             | Mock breakdown:[]. Assert container present.    | Renders without crash.              | Empty breakdown. | Passed  | 11/4/2026 | SangNHT |
| 34  | OO-018            | Handle empty trend data                                  | Mock trend events:[]. Assert container present. | Renders without crash.              | Empty trend.     | Passed  | 11/4/2026 | SangNHT |
| 35  | OO-019            | Handle large revenue values                              | Mock grossRevenue:10B. Query formatted text.    | Large value formatted.              | Large revenue.   | Passed  | 11/4/2026 | SangNHT |
| 36  | OO-020            | Handle high refund rate                                  | Mock high refunds. Query refund rate text.      | High rate displayed.                | High refunds.    | Passed  | 11/4/2026 | SangNHT |

---

## Feature 15: PackageOrderFailed (Organizer)

**Test requirement:** Verify payment failure page renders correctly, displays custom error messages, and navigates correctly on retry/home buttons.

**Integration Test File:** `src/test/integration/Organizer/PackageOrderFailed.test.tsx`

**Group Labels:** Render, Error Message, User Interactions, Edge Cases

| Row | Test Case ID      | Test Case Description                                   | Test Case Procedure                                        | Expected Results              | Pre-conditions      | Round 1 | Test date | Tester  |
| --- | ----------------- | ------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------- | ------------------- | ------- | --------- | ------- |
| 11  | Render            |                                                         |                                                            |                               |                     |         |           |         |
| 12  | PF-001            | Render without crashing                                 | Render. Query title.                                       | Title present.                | Default mocks.      | Passed  | 11/4/2026 | SangNHT |
| 13  | PF-002            | Render error icon                                       | Render. Query title text.                                  | Icon rendered (text present). | Default mocks.      | Passed  | 11/4/2026 | SangNHT |
| 14  | PF-003            | Render default error message                            | Render. Query default error text.                          | Default message displayed.    | Default mocks.      | Passed  | 11/4/2026 | SangNHT |
| 15  | PF-004            | Render action buttons                                   | Render. Query both buttons.                                | Both buttons present.         | Default mocks.      | Passed  | 11/4/2026 | SangNHT |
| 16  | Error Message     |                                                         |                                                            |                               |                     |         |           |         |
| 17  | PF-005            | Show custom error message from state                    | Mock location state message. Query message.                | Custom message displayed.     | State with message. | Passed  | 11/4/2026 | SangNHT |
| 18  | PF-006            | Show default message when no state message              | Mock state:null. Query default message.                    | Default message displayed.    | No state.           | Passed  | 11/4/2026 | SangNHT |
| 19  | PF-007            | Show default message when state has no message property | Mock state:{} no message. Query default.                   | Default message displayed.    | Empty state.        | Passed  | 11/4/2026 | SangNHT |
| 20  | User Interactions |                                                         |                                                            |                               |                     |         |           |         |
| 21  | PF-008            | Navigate to subscription page when clicking "Thu lai"   | Click "Thử lại". Assert navigate to subscription.          | Navigate called.              | Default mocks.      | Passed  | 11/4/2026 | SangNHT |
| 22  | PF-009            | Navigate to dashboard when clicking "Ve trang chu"      | Click "Về trang chủ". Assert navigate to dashboard.        | Navigate called.              | Default mocks.      | Passed  | 11/4/2026 | SangNHT |
| 23  | Edge Cases        |                                                         |                                                            |                               |                     |         |           |         |
| 24  | PF-010            | Handle null state gracefully                            | Mock state:null. Render. Query title.                      | Renders without crash.        | null state.         | Passed  | 11/4/2026 | SangNHT |
| 25  | PF-011            | Handle empty state object                               | Mock state:{}. Render. Query title.                        | Renders without crash.        | Empty state.        | Passed  | 11/4/2026 | SangNHT |
| 26  | PF-012            | Handle empty string message                             | Mock state message:"". Assert default NOT shown (uses ??). | Empty string rendered.        | Empty string state. | Passed  | 11/4/2026 | SangNHT |

---

## Feature 16: PackageOrderSuccess (Organizer)

**Test requirement:** Verify payment success page renders, shows transaction details, formats amounts correctly, and navigates correctly.

**Integration Test File:** `src/test/integration/Organizer/PackageOrderSuccess.test.tsx`

**Group Labels:** Render, Transaction Details, User Interactions, Edge Cases

| Row | Test Case ID        | Test Case Description                                         | Test Case Procedure                                     | Expected Results                     | Pre-conditions          | Round 1 | Test date | Tester  |
| --- | ------------------- | ------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------ | ----------------------- | ------- | --------- | ------- |
| 11  | Render              |                                                               |                                                         |                                      |                         |         |           |         |
| 12  | PS-001              | Render without crashing                                       | Render. Query success title.                            | Title present.                       | Default mocks.          | Passed  | 11/4/2026 | SangNHT |
| 13  | PS-002              | Render success icon                                           | Render. Query title text.                               | Icon rendered.                       | Default mocks.          | Passed  | 11/4/2026 | SangNHT |
| 14  | PS-003              | Render action buttons                                         | Render. Query both buttons.                             | Both buttons present.                | Default mocks.          | Passed  | 11/4/2026 | SangNHT |
| 15  | Transaction Details |                                                               |                                                         |                                      |                         |         |           |         |
| 16  | PS-004              | Show transaction details when state is provided               | Mock state transaction. Render. Query detail labels.    | Details displayed.                   | State with transaction. | Passed  | 11/4/2026 | SangNHT |
| 17  | PS-005              | Format amount correctly                                       | Mock transaction amount:1M. Query formatted text.       | "1.000.000 ₫" displayed.             | State with amount.      | Passed  | 11/4/2026 | SangNHT |
| 18  | PS-006              | Truncate transaction ID                                       | Mock long transaction ID. Query truncated text.         | Truncated ID displayed.              | Long ID.                | Passed  | 11/4/2026 | SangNHT |
| 19  | PS-007              | Show formatted date from transaction                          | Mock completedAt. Render. Query detail section.         | Date section displayed.              | State with date.        | Passed  | 11/4/2026 | SangNHT |
| 20  | PS-008              | Use current date when completedAt is missing                  | Mock transaction no date. Render. Query detail section. | Detail displayed with fallback date. | No date.                | Passed  | 11/4/2026 | SangNHT |
| 21  | User Interactions   |                                                               |                                                         |                                      |                         |         |           |         |
| 22  | PS-009              | Navigate to subscription page when clicking "Xem goi cua toi" | Click "Xem gói của tôi". Assert navigate.               | Navigate called.                     | Default mocks.          | Passed  | 11/4/2026 | SangNHT |
| 23  | PS-010              | Navigate to organizer page when clicking "Ve trang Organizer" | Click "Về trang Organizer". Assert navigate.            | Navigate called.                     | Default mocks.          | Passed  | 11/4/2026 | SangNHT |
| 24  | Edge Cases          |                                                               |                                                         |                                      |                         |         |           |         |
| 25  | PS-011              | Handle null state gracefully                                  | Mock state:null. Render. Query title.                   | Renders without crash.               | null state.             | Passed  | 11/4/2026 | SangNHT |
| 26  | PS-012              | Handle state with no transaction                              | Mock state:{} no transaction. Render. Query title.      | Renders without crash.               | Empty state.            | Passed  | 11/4/2026 | SangNHT |
| 27  | PS-013              | Handle transaction with partial data                          | Mock transaction only ID. Query ID.                     | Partial data displayed.              | Partial state.          | Passed  | 11/4/2026 | SangNHT |
| 28  | PS-014              | Render with message from transaction state                    | Mock state transaction message. Render. Query title.    | Title displayed.                     | State with message.     | Passed  | 11/4/2026 | SangNHT |

---

## Feature 17: PackageVNPayReturn (Organizer)

**Test requirement:** Verify VNPay callback flow processes payment response, navigates to success/failed pages, and handles network errors.

**Integration Test File:** `src/test/integration/Organizer/PackageVNPayReturn.test.tsx`

**Group Labels:** Render, API Calls, Navigation, Edge Cases

| Row | Test Case ID | Test Case Description                                               | Test Case Procedure                                                         | Expected Results                  | Pre-conditions      | Round 1 | Test date | Tester  |
| --- | ------------ | ------------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------- | ------------------- | ------- | --------- | ------- |
| 11  | Render       |                                                                     |                                                                             |                                   |                     |         |           |         |
| 12  | PV-001       | Render loading state                                                | Render. Query loading text.                                                 | Loading displayed.                | Default mocks.      | Passed  | 11/4/2026 | SangNHT |
| 13  | PV-002       | Render spinner                                                      | Render. Query loading text.                                                 | Spinner/loading present.          | Default mocks.      | Passed  | 11/4/2026 | SangNHT |
| 14  | API Calls    |                                                                     |                                                                             |                                   |                     |         |           |         |
| 15  | PV-003       | Call VNPay callback URL on mount                                    | Render. Wait. Assert fetch called with vnpay/return.                        | Fetch called.                     | Default mocks.      | Passed  | 11/4/2026 | SangNHT |
| 16  | PV-004       | Navigate to success page on successful payment                      | Mock fetch success response. Wait. Assert navigate to success.              | Navigate called with transaction. | Success response.   | Passed  | 11/4/2026 | SangNHT |
| 17  | PV-005       | Navigate to failed page on payment failure                          | Mock fetch failure response. Wait. Assert navigate to failed.               | Navigate called with message.     | Failure response.   | Passed  | 11/4/2026 | SangNHT |
| 18  | PV-006       | Navigate to failed page with default message if no message provided | Mock fetch response no message. Wait. Assert navigate with default message. | Default message used.             | No message.         | Passed  | 11/4/2026 | SangNHT |
| 19  | PV-007       | Navigate to failed page on fetch error                              | Mock fetch reject. Wait. Assert navigate to failed.                         | Navigate called.                  | Fetch error.        | Passed  | 11/4/2026 | SangNHT |
| 20  | Navigation   |                                                                     |                                                                             |                                   |                     |         |           |         |
| 21  | Edge Cases   |                                                                     |                                                                             |                                   |                     |         |           |         |
| 22  | PV-008       | Handle empty search params                                          | Mock empty searchParams. Render. Wait. Assert fetch called.                 | Fetch called with empty params.   | Empty params.       | Passed  | 11/4/2026 | SangNHT |
| 23  | PV-009       | Handle malformed response                                           | Mock fetch returns null json. Wait. Assert navigate to failed.              | Navigate called.                  | Malformed response. | Passed  | 11/4/2026 | SangNHT |

---

## Feature 18: PostPreview (Organizer)

**Test requirement:** Verify organizer can preview AI-generated post content, navigate back, handle loading/error states, and clean up on unmount.

**Integration Test File:** `src/test/integration/Organizer/PostPreviewPage.test.tsx`

**Group Labels:** Render, UI Elements, API Calls, User Interactions, Data Display, Edge Cases

| Row | Test Case ID      | Test Case Description                        | Test Case Procedure                                | Expected Results            | Pre-conditions   | Round 1 | Test date | Tester  |
| --- | ----------------- | -------------------------------------------- | -------------------------------------------------- | --------------------------- | ---------------- | ------- | --------- | ------- |
| 11  | Render            |                                              |                                                    |                             |                  |         |           |         |
| 12  | PP-001            | Render without crashing                      | Mock postDetail. Render. Query title.              | Title present.              | Post loaded.     | Passed  | 11/4/2026 | SangNHT |
| 13  | PP-002            | Show loading state                           | Mock loading:true. Query loading text.             | Loading displayed.          | Loading state.   | Passed  | 11/4/2026 | SangNHT |
| 14  | PP-003            | Show error state when post not found         | Mock error. Query error text.                      | Error displayed.            | Error state.     | Passed  | 11/4/2026 | SangNHT |
| 15  | PP-004            | Show default error when no post and no error | Mock no post, no error. Query default error.       | Default error displayed.    | Empty state.     | Passed  | 11/4/2026 | SangNHT |
| 16  | UI Elements       |                                              |                                                    |                             |                  |         |           |         |
| 17  | PP-005            | Render post title when loaded                | Mock postDetail title. Query title.                | Title displayed.            | Post loaded.     | Passed  | 11/4/2026 | SangNHT |
| 18  | PP-006            | Render AI badge                              | Mock postDetail. Query AI badge text.              | AI badge displayed.         | Post loaded.     | Passed  | 11/4/2026 | SangNHT |
| 19  | API Calls         |                                              |                                                    |                             |                  |         |           |         |
| 20  | PP-007            | Call fetchPostDetail on mount                | Render. Assert dispatch called.                    | fetchPostDetail dispatched. | Default mocks.   | Passed  | 11/4/2026 | SangNHT |
| 21  | PP-008            | Call clearPostDetail on unmount              | Render, then unmount. Assert dispatch called.      | clearPostDetail dispatched. | Post loaded.     | Passed  | 11/4/2026 | SangNHT |
| 22  | User Interactions |                                              |                                                    |                             |                  |         |           |         |
| 23  | PP-009            | Navigate back when clicking back button      | Mock navigate fn. Click back. Assert navigate(-1). | Navigate called.            | Post loaded.     | Passed  | 11/4/2026 | SangNHT |
| 24  | Data Display      |                                              |                                                    |                             |                  |         |           |         |
| 25  | PP-010            | Render post content with blocks              | Mock postDetail body. Query block-renderer.        | Blocks rendered.            | Post loaded.     | Passed  | 11/4/2026 | SangNHT |
| 26  | PP-011            | Include image in blocks when imageUrl exists | Mock postDetail imageUrl. Query block-count "2".   | Image block included.       | Post with image. | Passed  | 11/4/2026 | SangNHT |
| 27  | Edge Cases        |                                              |                                                    |                             |                  |         |           |         |
| 28  | PP-012            | Handle missing postId                        | Mock postId:undefined. Query default error.        | Default error displayed.    | id undefined.    | Passed  | 11/4/2026 | SangNHT |
| 29  | PP-013            | Handle post with empty body                  | Mock postDetail body:"". Query block-renderer.     | Blocks rendered.            | Empty body.      | Passed  | 11/4/2026 | SangNHT |

---

## Feature 19: ReportManagement (Organizer)

**Test requirement:** Verify report management page renders report table, sets/clears page config on mount/unmount.

**Integration Test File:** `src/test/integration/Organizer/ReportManagementPage.test.tsx`

**Group Labels:** Render, Page Config

| Row | Test Case ID | Test Case Description   | Test Case Procedure                               | Expected Results | Pre-conditions | Round 1 | Test date | Tester  |
| --- | ------------ | ----------------------- | ------------------------------------------------- | ---------------- | -------------- | ------- | --------- | ------- |
| 11  | Render       |                         |                                                   |                  |                |         |           |         |
| 12  | RM-001       | Render without crashing | Render. Query report-table.                       | Table present.   | Default mocks. | Passed  | 11/4/2026 | SangNHT |
| 13  | Page Config  |                         |                                                   |                  |                |         |           |         |
| 14  | RM-002       | Set page title on mount | Mock setConfig. Assert called with title.         | Config updated.  | Default mocks. | Passed  | 11/4/2026 | SangNHT |
| 15  | RM-003       | Clear config on unmount | Render, unmount. Assert setConfig called with {}. | Config cleared.  | Default mocks. | Passed  | 11/4/2026 | SangNHT |

---

## Feature 20: SeatMapEditor (Organizer)

**Test requirement:** Verify organizer can edit seat map using Konva canvas, fetch event/ticket/seatmap data, handle missing data, and validate seat map.

**Integration Test File:** `src/test/integration/Organizer/SeatMapEditorPage.test.tsx`

**Group Labels:** Render, API Calls, Loading States, Edge Cases

| Row | Test Case ID   | Test Case Description                            | Test Case Procedure                                 | Expected Results                   | Pre-conditions     | Round 1 | Test date | Tester  |
| --- | -------------- | ------------------------------------------------ | --------------------------------------------------- | ---------------------------------- | ------------------ | ------- | --------- | ------- |
| 11  | Render         |                                                  |                                                     |                                    |                    |         |           |         |
| 12  | SE-001         | Render without crashing                          | Render. Assert container present.                   | Renders without crash.             | Default mocks.     | Passed  | 11/4/2026 | SangNHT |
| 13  | SE-002         | Render Konva stage                               | Render. Wait. Query konva-stage.                    | Stage present.                     | Data loaded.       | Passed  | 11/4/2026 | SangNHT |
| 14  | SE-003         | Render editor toolbar                            | Render. Assert container present.                   | Toolbar rendered.                  | Default mocks.     | Passed  | 11/4/2026 | SangNHT |
| 15  | API Calls      |                                                  |                                                     |                                    |                    |         |           |         |
| 16  | SE-004         | Call fetchGetAllTicketTypes on mount             | Render. Wait. Assert dispatch called.               | fetchGetAllTicketTypes dispatched. | Default mocks.     | Passed  | 11/4/2026 | SangNHT |
| 17  | SE-005         | Call fetchEventById after ticket types are ready | Render. Wait. Assert dispatch called.               | fetchEventById dispatched.         | eventId provided.  | Passed  | 11/4/2026 | SangNHT |
| 18  | SE-006         | Call fetchGetSeatMap when eventId is available   | Render. Wait. Assert dispatch called.               | fetchGetSeatMap dispatched.        | eventId provided.  | Passed  | 11/4/2026 | SangNHT |
| 19  | Loading States |                                                  |                                                     |                                    |                    |         |           |         |
| 20  | SE-007         | Show loading when seat map is loading            | Mock loading:true. Assert container present.        | Loading state handled.             | Loading state.     | Passed  | 11/4/2026 | SangNHT |
| 21  | Edge Cases     |                                                  |                                                     |                                    |                    |         |           |         |
| 22  | SE-008         | Handle missing eventId                           | Mock eventId:undefined. Assert container present.   | Renders without crash.             | eventId undefined. | Passed  | 11/4/2026 | SangNHT |
| 23  | SE-009         | Handle null event data                           | Mock currentEvent:null. Assert container present.   | Renders without crash.             | null event.        | Passed  | 11/4/2026 | SangNHT |
| 24  | SE-010         | Handle empty sessions                            | Mock sessions:[]. Assert container present.         | Renders without crash.             | Empty sessions.    | Passed  | 11/4/2026 | SangNHT |
| 25  | SE-011         | Handle seat map parse error                      | Mock spec:"invalid-json". Assert container present. | Renders without crash.             | Invalid spec.      | Passed  | 11/4/2026 | SangNHT |

---

## Feature 21: SeatMapViewer (Organizer)

**Test requirement:** Verify attendee can view seat map, select areas/tickets, handle missing data, and create pending orders.

**Integration Test File:** `src/test/integration/Organizer/SeatMapViewerPage.test.tsx`

**Group Labels:** Render, API Calls, Loading States, Edge Cases

| Row | Test Case ID   | Test Case Description                          | Test Case Procedure                                    | Expected Results                   | Pre-conditions      | Round 1 | Test date | Tester  |
| --- | -------------- | ---------------------------------------------- | ------------------------------------------------------ | ---------------------------------- | ------------------- | ------- | --------- | ------- |
| 11  | Render         |                                                |                                                        |                                    |                     |         |           |         |
| 12  | SV-001         | Render without crashing                        | Render. Assert container present.                      | Renders without crash.             | Default mocks.      | Passed  | 11/4/2026 | SangNHT |
| 13  | SV-002         | Render Konva stage when data is loaded         | Mock seatMap spec with areas. Wait. Query konva-stage. | Stage present.                     | Seat map loaded.    | Passed  | 11/4/2026 | SangNHT |
| 14  | API Calls      |                                                |                                                        |                                    |                     |         |           |         |
| 15  | SV-003         | Call fetchEventByUrlPath on mount              | Render. Assert dispatch called with urlPath.           | fetchEventByUrlPath dispatched.    | urlPath provided.   | Passed  | 11/4/2026 | SangNHT |
| 16  | SV-004         | Call fetchGetSeatMap when eventId is available | Render. Wait. Assert dispatch called.                  | fetchGetSeatMap dispatched.        | eventId available.  | Passed  | 11/4/2026 | SangNHT |
| 17  | SV-005         | Call fetchGetAllTicketTypes on mount           | Render. Wait. Assert dispatch called.                  | fetchGetAllTicketTypes dispatched. | Default mocks.      | Passed  | 11/4/2026 | SangNHT |
| 18  | Loading States |                                                |                                                        |                                    |                     |         |           |         |
| 19  | SV-006         | Show loading when seat map is loading          | Mock loading:true. Assert container present.           | Loading state handled.             | Loading state.      | Passed  | 11/4/2026 | SangNHT |
| 20  | Edge Cases     |                                                |                                                        |                                    |                     |         |           |         |
| 21  | SV-007         | Handle missing urlPath                         | Mock urlPath:undefined. Assert container present.      | Renders without crash.             | urlPath undefined.  | Passed  | 11/4/2026 | SangNHT |
| 22  | SV-008         | Handle null event data                         | Mock currentEvent:null. Assert container present.      | Renders without crash.             | null event.         | Passed  | 11/4/2026 | SangNHT |
| 23  | SV-009         | Handle empty sessions                          | Mock sessions:[]. Assert container present.            | Renders without crash.             | Empty sessions.     | Passed  | 11/4/2026 | SangNHT |
| 24  | SV-010         | Handle empty ticket types                      | Mock ticketTypes:[]. Assert container present.         | Renders without crash.             | Empty ticket types. | Passed  | 11/4/2026 | SangNHT |
| 25  | SV-011         | Handle seat map with no areas                  | Mock spec empty areas. Wait. Query stage.              | Stage rendered.                    | Empty spec.         | Passed  | 11/4/2026 | SangNHT |
| 26  | SV-012         | Handle seat map with seats                     | Mock spec with seats. Wait. Query stage.               | Stage rendered with seats.         | Spec with seats.    | Passed  | 11/4/2026 | SangNHT |

---

## Feature 22: Subscription (Organizer)

**Test requirement:** Verify organizer can view AI subscription plans, manage quota, purchase packages, view purchase history, and handle wallet integration.

**Integration Test File:** `src/test/integration/Organizer/SubscriptionPage.test.tsx`

**Group Labels:** Render, UI Elements, API Calls, User Interactions, Data Display, Edge Cases

| Row | Test Case ID      | Test Case Description                                         | Test Case Procedure                                              | Expected Results                   | Pre-conditions           | Round 1 | Test date | Tester  |
| --- | ----------------- | ------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------- | ------------------------ | ------- | --------- | ------- |
| 11  | Render            |                                                               |                                                                  |                                    |                          |         |           |         |
| 12  | SU-001            | Render without crashing                                       | Render. Query "Subscription".                                    | Title present.                     | Default mocks.           | Passed  | 11/4/2026 | SangNHT |
| 13  | SU-002            | Show skeleton when loading all data                           | Mock all loading:true. Query skeletons.                          | Skeletons present.                 | Loading state.           | Passed  | 11/4/2026 | SangNHT |
| 14  | SU-003            | Not show skeleton when not loading                            | Render. Assert no skeletons.                                     | No skeletons.                      | Not loading.             | Passed  | 11/4/2026 | SangNHT |
| 15  | UI Elements       |                                                               |                                                                  |                                    |                          |         |           |         |
| 16  | SU-004            | Render page title and subtitle                                | Render. Query both texts.                                        | Both displayed.                    | Default mocks.           | Passed  | 11/4/2026 | SangNHT |
| 17  | SU-005            | Render back button                                            | Render. Query "Trở về".                                          | Button present.                    | Default mocks.           | Passed  | 11/4/2026 | SangNHT |
| 18  | SU-006            | Render wallet section                                         | Render. Query wallet-section.                                    | Section present.                   | Default mocks.           | Passed  | 11/4/2026 | SangNHT |
| 19  | API Calls         |                                                               |                                                                  |                                    |                          |         |           |         |
| 20  | SU-007            | Render quota cards when quota data is available               | Mock quota data. Query all 3 quota values.                       | All displayed.                     | Quota loaded.            | Passed  | 11/4/2026 | SangNHT |
| 21  | SU-008            | Render TopUp packages when available                          | Mock TopUp packages. Query "Nạp token lẻ".                       | TopUp section present.             | TopUp packages.          | Passed  | 11/4/2026 | SangNHT |
| 22  | SU-009            | Render subscription packages when available                   | Mock Subscription packages. Query "Gói đăng ký hàng tháng".      | Subscription section present.      | Subscription packages.   | Passed  | 11/4/2026 | SangNHT |
| 23  | SU-010            | Render active subscription banner when has active sub         | Mock recent purchase. Query banner.                              | Banner present.                    | Active subscription.     | Passed  | 11/4/2026 | SangNHT |
| 24  | SU-011            | Render purchase history table when has purchased packages     | Mock purchased packages. Query history title.                    | History table present.             | Purchased packages.      | Passed  | 11/4/2026 | SangNHT |
| 25  | SU-012            | Call fetchAIPackages on mount                                 | Render. Assert dispatch called.                                  | fetchAIPackages dispatched.        | Default mocks.           | Passed  | 11/4/2026 | SangNHT |
| 26  | SU-013            | Call fetchMyQuota on mount                                    | Render. Assert dispatch called.                                  | fetchMyQuota dispatched.           | Default mocks.           | Passed  | 11/4/2026 | SangNHT |
| 27  | SU-014            | Call fetchPurchasedPackages on mount                          | Render. Assert dispatch called.                                  | fetchPurchasedPackages dispatched. | Default mocks.           | Passed  | 11/4/2026 | SangNHT |
| 28  | SU-015            | Call fetchWalletUser with userId 5 on mount                   | Render. Assert dispatch called with 5.                           | fetchWalletUser dispatched.        | Default mocks.           | Passed  | 11/4/2026 | SangNHT |
| 29  | User Interactions |                                                               |                                                                  |                                    |                          |         |           |         |
| 30  | SU-016            | Open payment modal when selecting a plan                      | Mock TopUp package. Click package chip. Wait. Query modal.       | Modal opened.                      | Package loaded.          | Passed  | 11/4/2026 | SangNHT |
| 31  | SU-017            | Close payment modal when clicking close                       | Open modal. Click close. Assert modal removed.                   | Modal closed.                      | Modal open.              | Passed  | 11/4/2026 | SangNHT |
| 32  | SU-018            | Open payment modal when selecting subscription plan           | Mock subscription package. Click select-plan. Wait. Query modal. | Modal opened.                      | Subscription package.    | Passed  | 11/4/2026 | SangNHT |
| 33  | SU-019            | Navigate back when clicking back button                       | Click back button. Assert navigate(-1).                          | Navigate called.                   | Default mocks.           | Passed  | 11/4/2026 | SangNHT |
| 34  | SU-020            | Scroll to subscription section when clicking upgrade          | Mock active sub. Click upgrade. Assert scrollIntoView called.    | Scroll called.                     | Active subscription.     | Passed  | 11/4/2026 | SangNHT |
| 35  | Data Display      |                                                               |                                                                  |                                    |                          |         |           |         |
| 36  | SU-021            | Display quota values correctly                                | Mock quota. Query all labels.                                    | Labels displayed.                  | Quota loaded.            | Passed  | 11/4/2026 | SangNHT |
| 37  | SU-022            | Display TopUp packages sorted by price                        | Mock 2 TopUp packages. Assert order.                             | Sorted by price ascending.         | 2 TopUp packages.        | Passed  | 11/4/2026 | SangNHT |
| 38  | SU-023            | Display subscription plan cards                               | Mock 3 subscription packages. Assert card count.                 | 3 cards present.                   | 3 packages.              | Passed  | 11/4/2026 | SangNHT |
| 39  | SU-024            | Mark current subscription plan correctly                      | Mock recent Pro purchase. Assert Pro card is-current:true.       | Current plan marked.               | Active Pro subscription. | Passed  | 11/4/2026 | SangNHT |
| 40  | SU-025            | Display purchase history with correct data                    | Mock purchased package. Assert counts.                           | Correct data displayed.            | Purchase history.        | Passed  | 11/4/2026 | SangNHT |
| 41  | Edge Cases        |                                                               |                                                                  |                                    |                          |         |           |         |
| 42  | SU-026            | Not render active banner when subscription is expired         | Mock old purchase (60 days). Assert banner absent.               | Banner not rendered.               | Expired subscription.    | Passed  | 11/4/2026 | SangNHT |
| 43  | SU-027            | Not render TopUp section when no TopUp packages               | Mock only subscription packages. Assert TopUp section absent.    | Not rendered.                      | No TopUp.                | Passed  | 11/4/2026 | SangNHT |
| 44  | SU-028            | Not render subscription section when no subscription packages | Mock only TopUp. Assert subscription section absent.             | Not rendered.                      | No subscription.         | Passed  | 11/4/2026 | SangNHT |
| 45  | SU-029            | Not render history table when no purchased packages           | Mock purchased:[]. Assert history absent.                        | Not rendered.                      | No purchases.            | Passed  | 11/4/2026 | SangNHT |
| 46  | SU-030            | Handle quota loading state                                    | Mock quota loading:true. Query skeletons.                        | Skeletons present.                 | Loading state.           | Passed  | 11/4/2026 | SangNHT |
| 47  | SU-031            | Handle list loading state for subscription packages           | Mock list loading:true. Query skeletons.                         | Skeletons present.                 | Loading state.           | Passed  | 11/4/2026 | SangNHT |
| 48  | SU-032            | Handle packages with price 0 (Free tier)                      | Mock Free package price:0. Assert no plan cards.                 | Free not in cards.                 | Free package.            | Passed  | 11/4/2026 | SangNHT |
| 49  | SU-033            | Handle inactive packages                                      | Mock 1 inactive, 1 active. Assert only active card.              | Only active rendered.              | Mixed packages.          | Passed  | 11/4/2026 | SangNHT |
| 50  | SU-034            | Handle purchased packages with no lastPurchasedAt             | Mock purchased without date. Assert history present.             | History rendered.                  | No date.                 | Passed  | 11/4/2026 | SangNHT |
| 51  | SU-035            | Handle window.history.state being undefined                   | Set state:undefined. Click back. Assert navigate called.         | Navigate called.                   | No history state.        | Passed  | 11/4/2026 | SangNHT |

---

## Feature 23: Summary (Organizer)

**Test requirement:** Verify organizer can view event summary with revenue cards, sales trend charts, refund rate, transaction summary, and period selection.

**Integration Test File:** `src/test/integration/Organizer/SummaryPage.test.tsx`

**Group Labels:** Render, UI Elements, API Calls, User Interactions, Data Display, Edge Cases

| Row | Test Case ID      | Test Case Description                                     | Test Case Procedure                                                 | Expected Results                        | Pre-conditions              | Round 1 | Test date | Tester  |
| --- | ----------------- | --------------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------- | --------------------------- | ------- | --------- | ------- |
| 11  | Render            |                                                           |                                                                     |                                         |                             |         |           |         |
| 12  | SM-001            | Render without crashing                                   | Render. Query revenue-chart.                                        | Chart present.                          | Default mocks.              | Passed  | 11/4/2026 | SangNHT |
| 13  | SM-002            | Show loading spinner when loading and no stats            | Mock loading:true, overviewStats:null. Query .animate-spin.         | Spinner present.                        | Loading state.              | Passed  | 11/4/2026 | SangNHT |
| 14  | SM-003            | Not show spinner when loading but stats exist             | Mock loading:true but stats exist. Assert no spinners.              | No spinners.                            | Stats exist.                | Passed  | 11/4/2026 | SangNHT |
| 15  | SM-004            | Show empty state components when no data                  | Render. Query refund-rate-card and transaction-summary-card.        | Fallback cards present.                 | No data.                    | Passed  | 11/4/2026 | SangNHT |
| 16  | UI Elements       |                                                           |                                                                     |                                         |                             |         |           |         |
| 17  | SM-005            | Render revenue cards when overview stats exist            | Mock overviewStats. Query revenue-cards.                            | Cards present.                          | Stats loaded.               | Passed  | 11/4/2026 | SangNHT |
| 18  | SM-006            | Render revenue chart with period selector                 | Render. Query chart and both period buttons.                        | All present.                            | Default mocks.              | Passed  | 11/4/2026 | SangNHT |
| 19  | SM-007            | Render refund rate card                                   | Render. Query refund-rate-card.                                     | Card present.                           | Default mocks.              | Passed  | 11/4/2026 | SangNHT |
| 20  | SM-008            | Render transaction summary card                           | Render. Query transaction-summary-card.                             | Card present.                           | Default mocks.              | Passed  | 11/4/2026 | SangNHT |
| 21  | SM-009            | Render ticket type breakdown when available               | Mock overviewStats. Query table and chart.                          | Both present.                           | Stats loaded.               | Passed  | 11/4/2026 | SangNHT |
| 22  | API Calls         |                                                           |                                                                     |                                         |                             |         |           |         |
| 23  | SM-010            | Call fetchOverviewOrganizerStats on mount                 | Render. Wait. Assert dispatch.                                      | fetchOverviewOrganizerStats dispatched. | eventId provided.           | Passed  | 11/4/2026 | SangNHT |
| 24  | SM-011            | Call fetchSalesTrend on mount with default period         | Render. Wait. Assert dispatch with Day.                             | fetchSalesTrend dispatched.             | Default mocks.              | Passed  | 11/4/2026 | SangNHT |
| 25  | SM-012            | Call fetchRefundRate on mount                             | Render. Wait. Assert dispatch.                                      | fetchRefundRate dispatched.             | eventId provided.           | Passed  | 11/4/2026 | SangNHT |
| 26  | SM-013            | Call fetchTransactionSummary on mount                     | Render. Wait. Assert dispatch.                                      | fetchTransactionSummary dispatched.     | eventId provided.           | Passed  | 11/4/2026 | SangNHT |
| 27  | User Interactions |                                                           |                                                                     |                                         |                             |         |           |         |
| 28  | SM-014            | Call fetchSalesTrend when period changes                  | Clear dispatch. Click period-week. Wait. Assert dispatch with Week. | fetchSalesTrend dispatched with Week.   | Default mocks.              | Passed  | 11/4/2026 | SangNHT |
| 29  | SM-015            | Not call APIs if eventId is undefined                     | Mock eventId:undefined. Assert not dispatched.                      | APIs not called.                        | eventId undefined.          | Passed  | 11/4/2026 | SangNHT |
| 30  | SM-016            | Change period to Week when clicking Week button           | Render. Click week. Wait. Assert chart data-period.                 | Period updated to Week.                 | Default mocks.              | Passed  | 11/4/2026 | SangNHT |
| 31  | SM-017            | Change period back to Day when clicking Day button        | Change to Week, then click Day. Wait. Assert chart data-period.     | Period updated to Day.                  | Default mocks.              | Passed  | 11/4/2026 | SangNHT |
| 32  | Data Display      |                                                           |                                                                     |                                         |                             |         |           |         |
| 33  | SM-018            | Display revenue summary correctly                         | Mock overviewStats. Query total-revenue and tickets-sold.           | Correct values displayed.               | Stats loaded.               | Passed  | 11/4/2026 | SangNHT |
| 34  | SM-019            | Display sales trend data correctly                        | Mock salesTrend. Query trend-data-count.                            | Correct count displayed.                | Trend loaded.               | Passed  | 11/4/2026 | SangNHT |
| 35  | SM-020            | Display refund rate correctly                             | Mock refundRate. Query refund-rate.                                 | Correct rate displayed.                 | Refund rate loaded.         | Passed  | 11/4/2026 | SangNHT |
| 36  | SM-021            | Display transaction summary correctly                     | Mock transactionSummary. Query transaction-count.                   | Correct count displayed.                | Transaction summary loaded. | Passed  | 11/4/2026 | SangNHT |
| 37  | SM-022            | Display ticket type breakdown correctly                   | Mock overviewStats. Query breakdown counts.                         | Correct counts displayed.               | Stats loaded.               | Passed  | 11/4/2026 | SangNHT |
| 38  | Edge Cases        |                                                           |                                                                     |                                         |                             |         |           |         |
| 39  | SM-023            | Handle missing eventId gracefully                         | Mock eventId:undefined. Assert chart present.                       | Renders without crash.                  | eventId undefined.          | Passed  | 11/4/2026 | SangNHT |
| 40  | SM-024            | Handle overview stats with empty breakdown                | Mock overviewStats empty breakdown. Query revenue-cards.            | Cards present.                          | Empty breakdown.            | Passed  | 11/4/2026 | SangNHT |
| 41  | SM-025            | Handle refund rate with zero values                       | Mock refundRate all zeros. Query refund-rate "0%".                  | Zero displayed.                         | Zero values.                | Passed  | 11/4/2026 | SangNHT |
| 42  | SM-026            | Handle transaction summary with zero values               | Mock transactionSummary all zeros. Query transaction-count "0".     | Zero displayed.                         | Zero values.                | Passed  | 11/4/2026 | SangNHT |
| 43  | SM-027            | Handle sales trend with empty trend array                 | Mock salesTrend trend:[]. Query trend count "0".                    | Zero displayed.                         | Empty trend.                | Passed  | 11/4/2026 | SangNHT |
| 44  | SM-028            | Show loading state on revenue chart when trend is loading | Mock salesTrendLoading:true. Assert chart data-loading:true.        | Loading flag set.                       | Trend loading.              | Passed  | 11/4/2026 | SangNHT |
| 45  | SM-029            | Show loading state on refund rate card when loading       | Mock refundRate loading:true. Assert card data-loading:true.        | Loading flag set.                       | Refund loading.             | Passed  | 11/4/2026 | SangNHT |
| 46  | SM-030            | Show loading state on transaction card when loading       | Mock transaction loading:true. Assert card data-loading:true.       | Loading flag set.                       | Transaction loading.        | Passed  | 11/4/2026 | SangNHT |

---

## Feature 24: VoucherManagement (Organizer)

**Test requirement:** Verify organizer can manage vouchers: CRUD operations, search, filter by status, export Excel, validate forms, and handle pagination.

**Integration Test File:** `src/test/integration/Organizer/VoucherManagementPage.test.tsx`

**Group Labels:** Render, UI Elements, API Calls, User Interactions, Data Display, Edge Cases

| Row | Test Case ID      | Test Case Description                                | Test Case Procedure                                                                   | Expected Results                    | Pre-conditions           | Round 1 | Test date | Tester  |
| --- | ----------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------ | ------- | --------- | ------- |
| 11  | Render            |                                                      |                                                                                       |                                     |                          |         |           |         |
| 12  | VC-001            | Render without crashing                              | Render. Query title.                                                                  | Title present.                      | Default mocks.           | Passed  | 11/4/2026 | SangNHT |
| 13  | VC-002            | Show loading state                                   | Mock loading:true. Query "Đang tải...".                                               | Loading displayed.                  | Loading state.           | Passed  | 11/4/2026 | SangNHT |
| 14  | VC-003            | Show empty state when no vouchers                    | Mock items:[]. Query empty message.                                                   | Empty message displayed.            | Empty vouchers.          | Passed  | 11/4/2026 | SangNHT |
| 15  | VC-004            | Render voucher count badge                           | Mock 2 vouchers. Query count text.                                                    | Badge displayed.                    | 2 vouchers.              | Passed  | 11/4/2026 | SangNHT |
| 16  | UI Elements       |                                                      |                                                                                       |                                     |                          |         |           |         |
| 17  | VC-005            | Render search input                                  | Render. Query placeholder.                                                            | Input present.                      | Default mocks.           | Passed  | 11/4/2026 | SangNHT |
| 18  | VC-006            | Render filter button                                 | Render. Query "Bộ lọc".                                                               | Button present.                     | Default mocks.           | Passed  | 11/4/2026 | SangNHT |
| 19  | VC-007            | Render export Excel button                           | Render. Query "Xuất Excel".                                                           | Button present.                     | Default mocks.           | Passed  | 11/4/2026 | SangNHT |
| 20  | VC-008            | Render create voucher button                         | Render. Query "Tạo Voucher mới".                                                      | Button present.                     | Default mocks.           | Passed  | 11/4/2026 | SangNHT |
| 21  | VC-009            | Render table headers                                 | Render. Query all header texts.                                                       | All headers present.                | Default mocks.           | Passed  | 11/4/2026 | SangNHT |
| 22  | API Calls         |                                                      |                                                                                       |                                     |                          |         |           |         |
| 23  | VC-010            | Show filter dropdown when clicking filter button     | Click filter. Query all filter options.                                               | Options displayed.                  | Default mocks.           | Passed  | 11/4/2026 | SangNHT |
| 24  | VC-011            | Call fetchGetVouchers on mount                       | Render. Wait. Assert dispatch.                                                        | fetchGetVouchers dispatched.        | Default mocks.           | Passed  | 11/4/2026 | SangNHT |
| 25  | VC-012            | Call fetchCreateVoucher when creating voucher        | Open modal, fill form, submit. Wait. Assert dispatch.                                 | fetchCreateVoucher dispatched.      | Modal open, form filled. | Passed  | 11/4/2026 | SangNHT |
| 26  | VC-013            | Call fetchDeleteVoucher when deleting voucher        | Mock voucher. Click delete, confirm. Wait. Assert dispatch.                           | fetchDeleteVoucher dispatched.      | Voucher loaded.          | Passed  | 11/4/2026 | SangNHT |
| 27  | VC-014            | Call fetchExportExcelVoucher when exporting          | Mock blob. Click export. Wait. Assert dispatch.                                       | fetchExportExcelVoucher dispatched. | Default mocks.           | Passed  | 11/4/2026 | SangNHT |
| 28  | User Interactions |                                                      |                                                                                       |                                     |                          |         |           |         |
| 29  | VC-015            | Filter vouchers by search query                      | Mock 2 vouchers. Type "SUMMER". Wait. Assert only matching displayed.                 | Filtered results.                   | 2 vouchers.              | Passed  | 11/4/2026 | SangNHT |
| 30  | VC-016            | Filter vouchers by status                            | Mock expired and running. Click "Hết hạn". Assert running absent.                     | Status filtered.                    | Mixed vouchers.          | Passed  | 11/4/2026 | SangNHT |
| 31  | VC-017            | Open create modal when clicking create button        | Click create. Query modal title.                                                      | Modal opened.                       | Default mocks.           | Passed  | 11/4/2026 | SangNHT |
| 32  | VC-018            | Close create modal when clicking cancel              | Open modal. Click cancel. Assert modal absent.                                        | Modal closed.                       | Modal open.              | Passed  | 11/4/2026 | SangNHT |
| 33  | VC-019            | Open edit modal when clicking edit button            | Mock voucher. Click edit. Query edit modal title.                                     | Edit modal opened.                  | Voucher loaded.          | Passed  | 11/4/2026 | SangNHT |
| 34  | VC-020            | Open delete confirmation when clicking delete button | Mock voucher. Click delete. Query confirmation dialog.                                | Dialog opened.                      | Voucher loaded.          | Passed  | 11/4/2026 | SangNHT |
| 35  | VC-021            | Close delete confirmation when clicking cancel       | Open delete dialog. Click cancel. Assert dialog absent.                               | Dialog closed.                      | Dialog open.             | Passed  | 11/4/2026 | SangNHT |
| 36  | VC-022            | Validate voucher code format                         | Open modal. Type invalid code. Submit. Query error.                                   | Validation error displayed.         | Modal open.              | Passed  | 11/4/2026 | SangNHT |
| 37  | VC-023            | Validate value is positive                           | Open modal, fill valid code, submit without value. Query error.                       | Error displayed.                    | Modal open.              | Passed  | 11/4/2026 | SangNHT |
| 38  | VC-024            | Validate percentage value <= 100                     | Open modal. Type 150 value. Submit. Query error.                                      | Error displayed.                    | Modal open.              | Passed  | 11/4/2026 | SangNHT |
| 39  | VC-025            | Change voucher type between Percentage and Fixed     | Open modal. Select Fixed. Assert value.                                               | Type changed.                       | Modal open.              | Passed  | 11/4/2026 | SangNHT |
| 40  | Data Display      |                                                      |                                                                                       |                                     |                          |         |           |         |
| 41  | VC-026            | Display voucher details correctly                    | Mock voucher. Query code, value, status.                                              | All displayed correctly.            | Voucher loaded.          | Passed  | 11/4/2026 | SangNHT |
| 42  | VC-027            | Display fixed amount vouchers correctly              | Mock Fixed voucher. Query formatted amount.                                           | Amount displayed.                   | Fixed voucher.           | Passed  | 11/4/2026 | SangNHT |
| 43  | VC-028            | Display infinite symbol for unlimited vouchers       | Mock maxUse:0. Query "∞".                                                             | Infinity symbol displayed.          | Unlimited voucher.       | Passed  | 11/4/2026 | SangNHT |
| 44  | VC-029            | Display expired status for past vouchers             | Mock expired voucher. Query "Hết hạn".                                                | Expired status displayed.           | Expired voucher.         | Passed  | 11/4/2026 | SangNHT |
| 45  | VC-030            | Display maxed status for fully used vouchers         | Mock maxUse:10, totalUse:10. Query "Hết lượt".                                        | Maxed status displayed.             | Fully used voucher.      | Passed  | 11/4/2026 | SangNHT |
| 46  | VC-031            | Display filter status badge when filtered            | Click filter "Đang chạy". Query badge.                                                | Badge displayed.                    | Filter applied.          | Passed  | 11/4/2026 | SangNHT |
| 47  | VC-032            | Display date range for each voucher                  | Mock dates. Query formatted date.                                                     | Date range displayed.               | Voucher with dates.      | Passed  | 11/4/2026 | SangNHT |
| 48  | Edge Cases        |                                                      |                                                                                       |                                     |                          |         |           |         |
| 49  | VC-033            | Handle vouchers with null dates                      | Mock dates:null. Assert renders without crash.                                        | Renders normally.                   | null dates.              | Passed  | 11/4/2026 | SangNHT |
| 50  | VC-034            | Handle export failure                                | Mock dispatch reject. Click export. Assert notify.error.                              | Error notification shown.           | Export fails.            | Passed  | 11/4/2026 | SangNHT |
| 51  | VC-035            | Handle delete failure for used vouchers              | Mock delete reject with "used". Confirm delete. Assert notify.error.                  | Error notification shown.           | Used voucher.            | Passed  | 11/4/2026 | SangNHT |
| 52  | VC-036            | Handle duplicate voucher code error                  | Mock dispatch reject duplicate. Submit form. Assert notify.error.                     | Duplicate error shown.              | Duplicate code.          | Passed  | 11/4/2026 | SangNHT |
| 53  | VC-037            | Handle case-insensitive search                       | Mock voucher "SUMMER2024". Search "summer". Wait. Assert displayed.                   | Case-insensitive match.             | Voucher loaded.          | Passed  | 11/4/2026 | SangNHT |
| 54  | VC-038            | Reload vouchers after successful creation            | Mock empty vouchers, resolve create. Create voucher. Wait. Assert refetch dispatched. | Refetch dispatched.                 | Create success.          | Passed  | 11/4/2026 | SangNHT |
| 55  | VC-039            | Handle pagination page change                        | Mock 30 items, page 1. Click next. Wait. Assert dispatch page 2.                      | Page 2 dispatched.                  | Paginated data.          | Passed  | 11/4/2026 | SangNHT |
| 56  | VC-040            | Handle vouchers with maxUse = 0 (unlimited)          | Mock maxUse:0, totalUse:500. Query "∞" and "500".                                     | Both displayed.                     | Unlimited voucher.       | Passed  | 11/4/2026 | SangNHT |

---

---

## Summary: Tổng hợp tất cả 24 Features

| #         | Feature                          | TC Count | Group Labels | First Row | Last Row |
| --------- | -------------------------------- | -------- | ------------ | --------- | -------- |
| 1         | Analytics (Organizer)            | 17       | 6            | 12        | 33       |
| 2         | CheckIn (Organizer)              | 20       | 7            | 12        | 37       |
| 3         | CreateEvent (Organizer)          | 10       | 5            | 12        | 25       |
| 4         | EditEventWizard (Organizer)      | 22       | 6            | 12        | 37       |
| 5         | EventTicket (Organizer)          | 24       | 6            | 12        | 40       |
| 6         | Legal (Organizer)                | 10       | 5            | 12        | 25       |
| 7         | LegalDetail (Organizer)          | 16       | 5            | 12        | 31       |
| 8         | Marketing (Organizer)            | 4        | 3            | 12        | 17       |
| 9         | MarketingDetail (Organizer)      | 9        | 5            | 12        | 24       |
| 10        | MemberManagement (Organizer)     | 31       | 6            | 12        | 47       |
| 11        | MyEvents (Organizer)             | 34       | 7            | 12        | 55       |
| 12        | OrderList (Organizer)            | 10       | 5            | 12        | 25       |
| 13        | OrganizerAccount (Organizer)     | 20       | 7            | 12        | 37       |
| 14        | OrganizerOverviewAll (Organizer) | 20       | 6            | 12        | 37       |
| 15        | PackageOrderFailed (Organizer)   | 12       | 4            | 12        | 29       |
| 16        | PackageOrderSuccess (Organizer)  | 14       | 4            | 12        | 31       |
| 17        | PackageVNPayReturn (Organizer)   | 9        | 4            | 12        | 25       |
| 18        | PostPreview (Organizer)          | 13       | 6            | 12        | 31       |
| 19        | ReportManagement (Organizer)     | 3        | 2            | 12        | 17       |
| 20        | SeatMapEditor (Organizer)        | 11       | 4            | 12        | 27       |
| 21        | SeatMapViewer (Organizer)        | 12       | 4            | 12        | 28       |
| 22        | Subscription (Organizer)         | 35       | 6            | 12        | 53       |
| 23        | Summary (Organizer)              | 30       | 6            | 12        | 47       |
| 24        | VoucherManagement (Organizer)    | 40       | 6            | 12        | 58       |
| **TOTAL** |                                  | **436**  | **129**      |           |          |

---

## Prompt cho Claude để sinh Excel

Khi đưa prompt cho Claude, cần bao gồm:

```
Hãy sinh file Excel với cấu trúc sau:

1. **Cover sheet**:
   - Project Name: AIPromo – Event Management Platform
   - Project Code: AIPROMO
   - Document Code: =B5&"_"&"TR"&"_"&"v1.0"
   - Creator: SangNHT
   - Issue Date: 11/4/2026
   - Version: 1.0
   - Record of Change table

2. **Test Cases sheet**: Liệt kê tất cả functions theo mapping ở bảng Summary trên

3. **Test Statistics sheet**:
   - Có công thức COUNTIF linking đến từng Feature sheet
   - Test coverage và Test successful coverage formulas

4. **24 Feature sheets**:
   - Mỗi sheet bắt đầu bằng 1 hàng trống (row 1)
   - Header block rows 2-8
   - Header cột row 10
   - Data rows 11 trở đi (xen kẽ group labels và test cases)
   - **QUAN TRỌNG**: KHÔNG đổi màu bất kỳ cell nào
   - **Round 1**: Tất cả = "Passed"
   - **Test date**: Tất cả = "11/4/2026"
   - **Tester**: Tất cả = "SangNHT"
   - **Round 2, Round 3, Note**: Để trống

5. **Công thức**:
   - B4 (Number of TCs): =COUNTIF(A12:A1000,"*-*")
   - B6, C6, D6, E6 (Round 1 counts): COUNTIF($F10:$F998,B5) etc.
   - B7, C7, D7, E7 (Round 2 counts): Tương tự
   - B8, C8, D8, E8 (Round 3 counts): Tương tự
```

---

## Thứ tự sheets trong workbook

```
1.  Cover
2.  Test Cases
3.  Test Statistics
4.  Analytics (Organizer)
5.  CheckIn (Organizer)
6.  CreateEvent (Organizer)
7.  EditEventWizard (Organizer)
8.  EventTicket (Organizer)
9.  Legal (Organizer)
10. LegalDetail (Organizer)
11. Marketing (Organizer)
12. MarketingDetail (Organizer)
13. MemberManagement (Organizer)
14. MyEvents (Organizer)
15. OrderList (Organizer)
16. OrganizerAccount (Organizer)
17. OrganizerOverviewAll (Organizer)
18. PackageOrderFailed (Organizer)
19. PackageOrderSuccess (Organizer)
20. PackageVNPayReturn (Organizer)
21. PostPreview (Organizer)
22. ReportManagement (Organizer)
23. SeatMapEditor (Organizer)
24. SeatMapViewer (Organizer)
25. Subscription (Organizer)
26. Summary (Organizer)
27. VoucherManagement (Organizer)
```

---

## Ghi chú bổ sung

- File này **CHỈ chứa Integration Tests** (436 test cases). Unit tests (~1000 test cases) đã có file test riêng trong `src/test/unit/`.
- Tất cả test cases đã được **test thực tế** và **Passed** ở Round 1.
- File Excel template gốc: `Report5_Test Report.xlsx`
- File output2.md cũ **KHÔNG được sử dụng** nữa – file này (output3.md) là source of truth duy nhất.
