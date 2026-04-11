# 🧪 Test Guidelines - AIPromo-Web

> Hướng dẫn viết unit test cho project AIPromo-Web

---

## � Bắt đầu nhanh (Quick Start)

### Khi tạo file test mới

**Bước 1:** Tạo file theo cấu trúc `src/test/{Role}/{PageName}.test.tsx`

**Bước 2:** Thêm dòng này vào **ĐẦU TIÊN** trong file test:

```typescript
/// <reference types="jest" />
```

**Bước 3:** Nếu VS Code vẫn báo lỗi TypeScript (`Cannot find name 'jest'`):

1. Nhấn `Ctrl+Shift+P`
2. Gõ: `TypeScript: Restart TS Server`
3. Nhấn Enter
4. Đợi 2-3 giây, lỗi sẽ biến mất

> 💡 **Mẹo**: Nếu vẫn lỗi, reload window: `Ctrl+Shift+P` → `Developer: Reload Window`

---

## �📋 Mục lục

1. [Cài đặt](#-cài-đặt)
2. [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
3. [Configuration Files](#-configuration-files)
4. [Scripts](#-scripts)
5. [Quy ước viết test](#-quy-ước-viết-test)
6. [Test Checklist](#-test-checklist)
7. [Template cho Page Test](#-template-cho-page-test)
8. [Ví dụ thực tế](#-ví-dụ-thực-tế)

---

## 📦 Cài đặt

### Dependencies

```bash
npm install --save-dev \
  jest @types/jest ts-jest \
  @testing-library/react @testing-library/jest-dom @testing-library/user-event \
  jest-environment-jsdom identity-obj-proxy
```

### Package.json scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## 📁 Cấu trúc thư mục

### Nguyên tắc

- Tests nằm trong `src/test/`
- Organize theo **Role-based folder structure** (mirror theo `src/pages/`)
- Mỗi role có folder riêng: Organizer, Member, Admin, etc.

### Cấu trúc

```
src/
├── pages/
│   ├── Organizer/
│   │   ├── MyEventsPage.tsx
│   │   └── ...
│   ├── Member/
│   └── Admin/
│
└── test/
    ├── setupTests.ts              # Global setup (mocks, polyfills)
    ├── __mocks__/
    │   └── fileMock.js            # Mock static files
    ├── test-guidelines.md         # File này
    │
    ├── Organizer/                 # Tests cho Organizer pages
    │   └── MyEventsPage.test.tsx
    │
    ├── Member/                    # Tests cho Member pages
    │   └── BookingPage.test.tsx
    │
    └── shared/                    # Tests cho shared components
        ├── SearchBar.test.tsx
        └── Pagination.test.tsx
```

### Quy tắc đặt tên

| Type          | Path Pattern                               | Ví dụ                                      |
| ------------- | ------------------------------------------ | ------------------------------------------ |
| **Page**      | `src/test/{Role}/{PageName}.test.tsx`      | `src/test/Organizer/MyEventsPage.test.tsx` |
| **Component** | `src/test/shared/{ComponentName}.test.tsx` | `src/test/shared/SearchBar.test.tsx`       |
| **Hook**      | `src/test/hooks/{hookName}.test.ts`        | `src/test/hooks/useAuth.test.ts`           |
| **Utils**     | `src/test/utils/{utilName}.test.ts`        | `src/test/utils/mapStatus.test.ts`         |
| **Store**     | `src/test/store/{sliceName}.test.ts`       | `src/test/store/eventSlice.test.ts`        |

### Import paths

Từ `src/test/{Role}/`:

```typescript
// Page component
import MyEventsPage from "../../pages/Organizer/MyEventsPage";

// Redux slices
import { fetchAllEventsByMe } from "../../store/eventSlice";

// Components
import EventCard from "../../components/Organizer/events/EventCards";
```

Từ `src/test/shared/`:

```typescript
// Shared component
import SearchBar from "../../components/Organizer/shared/SearchBar";
```

---

## ⚙️ Configuration Files

### 1. `jest.config.ts` (root)

```typescript
export default {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src"],

  // Mock static files và CSS
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(gif|ttf|eot|svg|png|jpg|jpeg)$":
      "<rootDir>/src/test/__mocks__/fileMock.js",
  },

  // Setup files chạy trước mỗi test
  setupFilesAfterEnv: [
    "<rootDir>/src/test/setupTests.ts",
    "@testing-library/jest-dom",
  ],

  // Transform TypeScript
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.test.json",
      },
    ],
  },

  // Transform một số node_modules cần thiết
  transformIgnorePatterns: [
    "node_modules/(?!(react-router-dom|react-redux|@reduxjs/toolkit)/)",
  ],

  // Coverage
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/main.tsx",
    "!src/vite-env.d.ts",
  ],
};
```

### 2. `tsconfig.test.json` (root)

```json
{
  "extends": "./tsconfig.app.json",
  "compilerOptions": {
    "module": "CommonJS",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "jsx": "react-jsx",
    "strict": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "verbatimModuleSyntax": false,
    "types": ["jest", "node", "@testing-library/jest-dom"]
  },
  "include": ["src"]
}
```

### 3. `src/test/setupTests.ts`

File setup global chạy trước mỗi test:

```typescript
// Polyfills
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any

// Suppress React act() warnings (development only)
const originalError = console.error
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('was not wrapped in act')
    ) {
      return  // Suppress these warnings
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

// Mock window APIs
Object.defineProperty(window, 'matchMedia', { ... })
```

> 💡 **Lưu ý**: File này tự động suppress React 19 `act()` warnings để output test sạch sẽ hơn. Các lỗi khác vẫn được hiển thị bình thường.

### 4. `src/test/__mocks__/fileMock.js`

```javascript
export default "test-file-stub";
```

### 5. `src/test/jest-dom.d.ts`

File type declaration cho các custom matchers từ `@testing-library/jest-dom`:

```typescript
/// <reference types="@testing-library/jest-dom" />

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveValue(value: string): R;
      toHaveAttribute(attr: string, value?: string): R;
      // ... các matchers khác
    }
  }
}
```

**⚠️ Fix lỗi TypeScript**: Nếu gặp lỗi như:

- `Property 'toBeInTheDocument' does not exist on type 'JestMatchers'`
- `Property 'toHaveValue' does not exist on type 'JestMatchers'`

→ Đảm bảo file `jest-dom.d.ts` tồn tại trong `src/test/`  
→ Restart TS Server: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

---

## 📝 Quy ước viết test

### Cơ bản

- ✅ Dùng **Jest** + **React Testing Library**
- ✅ File extension: `.test.tsx` hoặc `.test.ts`
- ✅ Đặt trong `src/test/{Role}/` hoặc `src/test/shared/`
- ✅ Mock child components để isolate test
- ✅ Mock Redux và React Router hooks
- ✅ Luôn dùng `act()` cho state updates

### Mock Strategy

#### 1. Mock Child Components

```typescript
jest.mock('../../components/Organizer/events/EventCards', () => ({
  __esModule: true,
  default: ({ event, isMember }: { event: any; isMember?: boolean }) => (
    <div data-testid="event-card" data-is-member={isMember}>
      <span data-testid="event-title">{event.title}</span>
      <span data-testid="event-status">{event.status}</span>
    </div>
  ),
}))
```

#### 2. Mock Redux

```typescript
const mockDispatch = jest.fn();
let mockAuthState: any = {};
let mockEventState: any = {};

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useSelector: (selector: any) =>
    selector({
      AUTH: mockAuthState,
      EVENT: mockEventState,
    }),
  useDispatch: () => mockDispatch,
}));
```

#### 3. Mock React Router

```typescript
const mockUseOutletContext = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useOutletContext: () => mockUseOutletContext(),
}));
```

#### 4. Mock Redux Actions

```typescript
jest.mock("../../store/eventSlice", () => ({
  fetchAllEventsByMe: jest.fn((params) => ({
    type: "EVENT/fetchAllEventsByMe",
    payload: params,
  })),
}));
```

### Test Data Helpers

```typescript
const createMockOrganizerEvent = (overrides = {}) => ({
  id: "event-1",
  title: "Test Event",
  bannerUrl: "https://example.com/banner.jpg",
  location: "Ho Chi Minh City",
  eventStartAt: "2024-12-01T10:00:00Z",
  eventEndAt: "2024-12-01T18:00:00Z",
  status: "Draft" as const,
  ...overrides,
});
```

### beforeEach Setup

```typescript
beforeEach(() => {
  jest.clearAllMocks();

  // Reset mock states
  mockAuthState = { currentInfor: { roles: ["Organizer"] } };
  mockEventState = { myEvents: [], pagination: { totalPages: 1 } };

  // Mock hooks
  mockUseOutletContext.mockReturnValue({ setConfig: jest.fn() });
  mockDispatch.mockResolvedValue({});
});
```

---

## ✅ Test Checklist

### Cho Pages

Khi viết test cho Page, cần test các mục sau:

- [ ] **1. Render** - Page render không lỗi
- [ ] **2. UI Elements** - Các elements chính hiển thị đúng
- [ ] **3. User Interactions** - Click, input, filter, pagination...
- [ ] **4. API Calls** - Redux dispatch calls đúng
- [ ] **5. Role-based Behavior** - Khác nhau theo role (nếu có)
- [ ] **6. Data Display** - Hiển thị data đúng
- [ ] **7. Edge Cases** - Null data, empty state, error states

### Cho Components

- [ ] **1. Render** - Render với props khác nhau
- [ ] **2. Events** - Event handlers hoạt động đúng
- [ ] **3. Edge Cases** - Props đặc biệt, null/undefined

### Cho Hooks

- [ ] **1. Return Values** - Hook trả về đúng
- [ ] **2. Side Effects** - Effects chạy đúng
- [ ] **3. Re-renders** - Updates state đúng

### Cho Utils

- [ ] **1. Normal Cases** - Input bình thường
- [ ] **2. Edge Cases** - Input đặc biệt/null/empty
- [ ] **3. Error Cases** - Error handling

---

## 📝 Template cho Page Test

```typescript
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import MyPage from '../../pages/{Role}/{PageName}'

// ============================================================================
// MOCKS
// ============================================================================

// Mock react-router-dom
const mockUseOutletContext = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useOutletContext: () => mockUseOutletContext(),
}))

// Mock Redux
const mockDispatch = jest.fn()
let mockAuthState: any = {}
let mockEventState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({
    AUTH: mockAuthState,
    EVENT: mockEventState,
  }),
  useDispatch: () => mockDispatch,
}))

// Mock Redux actions
jest.mock('../../store/{sliceName}', () => ({
  {actionName}: jest.fn(),
}))

// Mock child components
jest.mock('../../components/{Role}/{ComponentName}', () => ({
  __esModule: true,
  default: (props: any) => <div data-testid="mock-component" {...props} />,
}))

// ============================================================================
// TEST DATA
// ============================================================================

const createMockData = (overrides = {}) => ({
  id: '1',
  title: 'Test Item',
  ...overrides,
})

// ============================================================================
// TESTS
// ============================================================================

describe('{PageName}', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockAuthState = { currentInfor: { roles: ['{Role}'] } }
    mockEventState = { data: [], pagination: { totalPages: 1 } }

    mockUseOutletContext.mockReturnValue({ setConfig: jest.fn() })
    mockDispatch.mockResolvedValue({})
  })

  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => {
        render(<MyPage />)
      })

      expect(screen.getByTestId('main-element')).toBeInTheDocument()
    })
  })

  describe('UI Elements', () => {
    it('should render search bar', async () => {
      await act(async () => {
        render(<MyPage />)
      })

      expect(screen.getByTestId('search-bar')).toBeInTheDocument()
    })
  })

  describe('API Calls', () => {
    it('should call fetchMe on mount', async () => {
      const { fetchMe } = require('../../store/authSlice')

      await act(async () => {
        render(<MyPage />)
      })

      expect(mockDispatch).toHaveBeenCalledWith(fetchMe())
    })
  })

  describe('User Interactions', () => {
    it('should update search query when typing', async () => {
      await act(async () => {
        render(<MyPage />)
      })

      const searchBar = screen.getByTestId('search-bar')
      await userEvent.type(searchBar, 'Test')

      expect(searchBar).toHaveValue('Test')
    })
  })

  describe('Data Display', () => {
    it('should display data correctly', async () => {
      mockEventState.data = [createMockData()]

      await act(async () => {
        render(<MyPage />)
      })

      expect(screen.getByText('Test Item')).toBeInTheDocument()
    })

    it('should show empty state when no data', async () => {
      mockEventState.data = []

      await act(async () => {
        render(<MyPage />)
      })

      expect(screen.getByText('Không có dữ liệu')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle null values', async () => {
      mockEventState.data = [createMockData({ field: null })]

      await act(async () => {
        render(<MyPage />)
      })

      expect(screen.getByTestId('field')).toHaveTextContent('Default')
    })
  })

  describe('Role-based Behavior', () => {
    it('should behave differently for different roles', async () => {
      mockAuthState.currentInfor = { roles: ['Admin'] }

      await act(async () => {
        render(<MyPage />)
      })

      expect(screen.getByTestId('admin-feature')).toBeInTheDocument()
    })
  })
})
```

---

## 💡 Ví dụ thực tế

### 🤖 Prompt cho Qwen (Copy & Paste)

Sử dụng prompt này để yêu cầu Qwen viết test:

```
Viết unit test cho {PageName}.tsx theo guidelines trong test-guidelines.md

📍 Thông tin file:
- Page cần test: src/pages/{Role}/{PageName}.tsx
- Test file sẽ tạo ở: src/test/{Role}/{PageName}.test.tsx
- Role: {Role}

📦 Dependencies:
- State management: Redux (useSelector, useDispatch)
- Routing: React Router (useOutletContext, useNavigate, useParams)
- Child components: {list các component con chính}

✨ Features cần test:
1. {Feature 1 - ví dụ: Hiển thị danh sách events}
2. {Feature 2 - ví dụ: Search và filter}
3. {Feature 3 - ví dụ: Pagination}
4. {Feature 4 - ví dụ: Loading states}
5. {Feature 5 - ví dụ: Error handling}

🎯 Test checklist (theo guidelines):
- [ ] Render không lỗi
- [ ] UI Elements chính (search, filters, pagination...)
- [ ] User interactions (click, input, submit...)
- [ ] API calls (Redux dispatch)
- [ ] Data display (thành công, empty state)
- [ ] Edge cases (null, undefined, error...)
- [ ] Role-based behavior (nếu có)

⚙️ Yêu cầu kỹ thuật:
- Thêm /// <reference types="jest" /> ở đầu file
- Mock child components bằng jest.mock()
- Mock Redux hooks (useSelector, useDispatch)
- Mock React Router hooks (useOutletContext)
- Mock Redux actions (createAsyncThunk)
- Dùng act() cho mọi state updates
- Mock data đầy đủ cho các test cases
```

### 📝 Example: MyEventsPage

```
Viết unit test cho MyEventsPage.tsx theo guidelines trong test-guidelines.md

📍 Thông tin file:
- Page cần test: src/pages/Organizer/MyEventsPage.tsx
- Test file sẽ tạo ở: src/test/Organizer/MyEventsPage.test.tsx
- Role: Organizer

📦 Dependencies:
- State management: Redux (useSelector, useDispatch)
- Routing: React Router (useOutletContext)
- Child components: EventCard, SearchBar, StatusFilters, Pagination

✨ Features cần test:
1. Hiển thị danh sách events của organizer
2. Search events theo tên
3. Filter theo status (Draft, Upcoming, Past, Pending, Suspend)
4. Pagination
5. Loading states (skeleton)
6. Empty state khi không có events
7. Role-based: Organizer vs Member view khác nhau

🎯 Test checklist:
- [ ] Render không lỗi
- [ ] UI Elements (search bar, status filters, pagination)
- [ ] User interactions (typing search, clicking filters, pagination)
- [ ] API calls (fetchMe, fetchAllEventsByMe, fetchEventListAssignedForCurrentUser)
- [ ] Data display (events list, empty state)
- [ ] Edge cases (null dates, rejection reasons, no roles)
- [ ] Role-based behavior (Organizer có filters/pagination, Member thì không)
```

### Example: MyEventsPage

**Page**: `src/pages/Organizer/MyEventsPage.tsx`  
**Test**: `src/test/Organizer/MyEventsPage.test.tsx`  
**Tests**: 34 tests - All passing ✅

**Features tested**:

- ✅ Render với organizer/member role
- ✅ Search bar, status filters, pagination
- ✅ Redux API calls (fetchMe, fetchAllEventsByMe)
- ✅ User interactions (typing, clicking, filtering)
- ✅ Data display (organizer events, member events)
- ✅ Edge cases (null dates, empty state, rejection reasons)
- ✅ Role-based behavior

---

## 🚀 Chạy tests

```bash
# Chạy tất cả tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Chạy test cụ thể
npm test -- [tên_file]
```

---

## 📚 Tài liệu tham khảo

- [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Docs](https://jestjs.io/docs/getting-started)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

> **Note**: Luôn chạy `npm test` trước khi commit để đảm bảo tests pass.
