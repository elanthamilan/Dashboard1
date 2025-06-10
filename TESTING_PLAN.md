# Student Information System - Comprehensive Test Plan

## Introduction

This document provides a comprehensive test plan for the Student Information System (SIS) dashboard application. It outlines the overall testing strategy, detailed test cases for various modules, and general considerations applicable across the entire system. The goal is to ensure a high-quality, reliable, and user-friendly application.

This test plan covers the following main sections:

1.  **Overall Test Strategy:** Defines the types of testing, recommended tools, key focus areas, and the test environment.
2.  **Test Plan: Admissions & Enrollment Dashboard:** Details unit tests, component tests, and conceptual integration/E2E scenarios for the admissions module.
3.  **Test Plan: Attendance Tracking Dashboard:** Details unit tests, component tests, and conceptual integration/E2E scenarios for the attendance module.
4.  **General Test Considerations:** Covers cross-cutting concerns such as internationalization, responsiveness, accessibility, error handling, and usability.

---
# Student Information System - Test Plan

## 1. Overall Test Strategy

This document outlines the testing strategy for the Student Information System (SIS) dashboard application. The goal is to ensure the application is reliable, functional, and provides a good user experience.

### 1.1. Testing Types

The testing process will incorporate several types of tests:

*   **Unit Tests:**
    *   **Objective:** To verify the smallest individual units of code (functions, methods, or isolated components) work as expected.
    *   **Scope:** Focus on utility functions, complex calculations, data transformation logic, and individual React components with minimal dependencies.
    *   **Tools:** Jest, React Testing Library (RTL).
    *   **Examples:** Testing a grade point calculation function, verifying a component renders correctly with given props, testing mock data generator output structures.

*   **Component Tests:**
    *   **Objective:** To test individual React components in isolation or with minimal mocking of dependencies. This is an extension of unit testing for UI components.
    *   **Scope:** Verify component rendering, prop handling, user interactions (clicks, input), state changes within the component, and accessibility attributes.
    *   **Tools:** Jest, React Testing Library (RTL).
    *   **Examples:** Testing that a form component updates its state on input, a button click triggers a callback, or a table component sorts data correctly based on user interaction.

*   **Integration Tests (Conceptual):**
    *   **Objective:** To verify that different components and services within a module interact correctly.
    *   **Scope:** Focus on the interaction between components within a specific dashboard module (e.g., how filtering in a table affects a chart in the same module, or how form submission updates a list).
    *   **Tools:** While Jest and RTL can be used for some frontend integration tests, this section will primarily define conceptual scenarios of component interactions to be manually verified or targeted during E2E testing if automated.
    *   **Examples:** Ensuring that selecting a filter in one component updates the data displayed in another component within the same dashboard.

*   **End-to-End (E2E) Test Scenarios (Conceptual):**
    *   **Objective:** To simulate real user scenarios by testing the application flow from start to finish.
    *   **Scope:** Cover key user workflows across different modules, ensuring the integrated system functions as expected from a user's perspective.
    *   **Tools:** This plan will define conceptual E2E scenarios. For automation, tools like Cypress or Playwright would be recommended.
    *   **Examples:** A user logging in, navigating to a dashboard, interacting with filters, viewing details, and submitting a form.

### 1.2. Testing Tools & Frameworks (Recommended)

*   **Unit/Component Testing:**
    *   [Jest](https://jestjs.io/): A JavaScript testing framework.
    *   [React Testing Library (RTL)](https://testing-library.com/docs/react-testing-library/intro/): Provides utilities to test React components in a way that resembles how users interact with them.
*   **End-to-End Testing (Automation - Conceptual for this plan):**
    *   [Cypress](https://www.cypress.io/): A JavaScript E2E testing framework.
    *   [Playwright](https://playwright.dev/): A Node.js library for browser automation.
*   **Static Analysis & Linting:**
    *   ESLint, Prettier (already set up) for code quality and consistency.
    *   TypeScript compiler (`tsc`) for static type checking.

### 1.3. Focus Areas

Across all testing types, special attention will be given to:

*   **UI Rendering & Accuracy:** Ensuring components render correctly with given data and props.
*   **Data Display & Integrity:** Verifying that data from mock sources is displayed accurately and consistently.
*   **User Interactivity:** Testing all interactive elements like forms, buttons, filters, sorting, pagination, and modals.
*   **State Management:** Ensuring component and application state is managed correctly and UI updates as expected.
*   **Responsiveness (Conceptual):** Manually verifying or describing checks for major views on different screen sizes (desktop, tablet, mobile).
*   **Internationalization (i18n):** Ensuring all user-facing text is correctly translated and displayed according to the selected language (English/Spanish).
*   **Accessibility (Conceptual - WCAG 2.1 AA):** Describing checks for keyboard navigation, focus management, ARIA attributes, and screen reader compatibility for key interactive elements.
*   **Error Handling:** Verifying graceful error handling, including form validation messages and feedback for failed operations (though most operations are mock for now).
*   **Empty States/Loading States:** Ensuring appropriate indicators (spinners, messages) are shown during data loading or when no data is available for a component.

### 1.4. Test Environment

*   **Unit/Component tests:** Would typically run in a Node.js environment using Jest.
*   **E2E tests (if automated):** Would run in a browser environment controlled by Cypress or Playwright.
*   **Manual testing (for conceptual scenarios):** Performed in standard web browsers (Chrome, Firefox, Safari, Edge).

This overall strategy will guide the development of specific test cases for each module.

## 2. Test Plan: Admissions & Enrollment Dashboard

This section details the test cases for the Admissions & Enrollment Dashboard.

### 2.1. Unit Test Cases

*   **`src/utils/mockData/admissions/generateMockApplicants.ts`:**
    *   **Test Case AD-UT-001:** Verify `generateMockApplicant()` creates an applicant object matching the `Applicant` interface structure.
        *   **Assertions:** Check for presence and correct types of key fields (id, firstName, email, applicationDate, programId, status, funnelStage, originCoordinates).
    *   **Test Case AD-UT-002:** Verify `generateMockApplicants(count)` generates the specified number of applicant records.
        *   **Assertions:** Ensure the returned array length matches `count`.
    *   **Test Case AD-UT-003 (Conceptual):** Validate `getFunnelStage(status)` utility returns correct stage numbers for each `ApplicationStatus`. (This utility is currently embedded in `generateMockApplicants.ts` but could be extracted for easier testing).
*   **`src/components/AdmissionsDashboard/AdmissionsDashboard.tsx` (KPI Calculation Logic):**
    *   **Test Case AD-UT-004:** Test KPI calculation logic (e.g., `kpiData` useMemo hook) with various mock applicant datasets.
        *   **Input:** Arrays of `Applicant` objects with different statuses.
        *   **Assertions:**
            *   Verify `totalApplicants` count is correct.
            *   Verify `shortlistedCount` calculation is accurate.
            *   Verify `offersMadeCount` calculation is accurate.
            *   Verify `conversionRate` calculation is correct (based on 'Accepted' or 'Enrollment Confirmed' vs. total).
        *   **Note:** This might be better tested as part of component testing if tightly coupled, or by extracting calculation logic into pure functions.

### 2.2. Component Test Cases (React Testing Library Concepts)

*   **`KpiCard` (defined within `AdmissionsDashboard.tsx` or as a shared component):**
    *   **Test Case AD-CT-001:** Renders title and value passed via props.
        *   **Setup:** Mount component with mock title and value.
        *   **Assertions:** Check if title and formatted value are present in the rendered output.
    *   **Test Case AD-CT-002:** Displays loading state correctly.
        *   **Setup:** Mount component with `loading={true}`.
        *   **Assertions:** Check for Ant Design `Spin` indicator or loading class.

*   **`ApplicantFunnelChart.tsx`:**
    *   **Test Case AD-CT-003:** Renders the Nivo Funnel chart component.
        *   **Setup:** Mount with mock applicant data.
        *   **Assertions:** Check if the chart container and SVG elements are rendered.
    *   **Test Case AD-CT-004:** Processes and displays data correctly based on `funnelStage`.
        *   **Setup:** Mount with a small, controlled set of applicant data with known `funnelStage` values.
        *   **Assertions:** Verify the funnel segments and their counts match the input data.
    *   **Test Case AD-CT-005:** Handles empty state (no data).
        *   **Setup:** Mount with an empty array of applicants.
        *   **Assertions:** Check for "No data available" message.
    *   **Test Case AD-CT-006:** Handles loading state.
        *   **Setup:** Mount with `loading={true}`.
        *   **Assertions:** Check for loading indicator within the card.

*   **`KeyDeadlinesTimeline.tsx`:**
    *   **Test Case AD-CT-007:** Renders timeline items from mock deadline data.
        *   **Setup:** Mount component (uses internally defined mock deadlines).
        *   **Assertions:** Verify correct number of `Timeline.Item` components, dates, and translated titles/descriptions.
    *   **Test Case AD-CT-008:** Displays correct status indicators (past, upcoming, today).
        *   **Setup:** Adjust mock deadline dates to represent past, present, and future.
        *   **Assertions:** Check for appropriate icons/tags/styling for each status.

*   **`ApplicantTable.tsx`:**
    *   **Test Case AD-CT-009:** Renders table with correct columns and applicant data.
        *   **Setup:** Mount with mock applicants data.
        *   **Assertions:** Verify table headers (ID, Name, Program, Status, Application Date, Actions). Check if rows render correct data.
    *   **Test Case AD-CT-010:** Pagination works as expected.
        *   **Setup:** Mount with more applicants than default page size (e.g., 15 applicants for page size 10).
        *   **Assertions:** Verify pagination controls are present. Simulate page change and check if displayed data updates.
    *   **Test Case AD-CT-011:** Client-side sorting by name, program, status, application date.
        *   **Setup:** Mount with unsorted applicant data.
        *   **Assertions:** Simulate click on sortable column headers. Verify data in the table re-orders correctly.
    *   **Test Case AD-CT-012:** Text search filters table rows.
        *   **Setup:** Mount with mock data.
        *   **Assertions:** Enter search terms in the input field (Name, Program, ID). Verify table updates to show only matching rows.
    *   **Test Case AD-CT-013:** Status filter (dropdown) filters table rows.
        *   **Setup:** Mount with mock data.
        *   **Assertions:** Select one or more statuses from the dropdown. Verify table updates.
    *   **Test Case AD-CT-014:** Date range filter filters table rows by application date.
        *   **Setup:** Mount with mock data.
        *   **Assertions:** Select a date range. Verify table updates to show applicants within that range.
    *   **Test Case AD-CT-015:** "View Details" button calls `onViewDetails` prop with correct applicant data.
        *   **Setup:** Mount with a mock `onViewDetails` function.
        *   **Assertions:** Simulate click on a "View Details" button. Verify `onViewDetails` was called with the corresponding applicant object.

*   **`ApplicantDetailModal.tsx`:**
    *   **Test Case AD-CT-016:** Renders correctly when `visible` is true and an applicant is provided.
        *   **Setup:** Mount with `visible={true}` and a mock applicant object.
        *   **Assertions:** Verify modal title, tabs (Personal, Documents, etc.), and key applicant details are displayed.
    *   **Test Case AD-CT-017:** Does not render or is hidden when `visible` is false.
        *   **Setup:** Mount with `visible={false}`.
        *   **Assertions:** Verify modal is not present in the DOM or is hidden.
    *   **Test Case AD-CT-018:** `onClose` prop is called when the modal's close button (or mask) is clicked.
        *   **Setup:** Mount with `visible={true}` and a mock `onClose` function.
        *   **Assertions:** Simulate click on the modal's close icon. Verify `onClose` was called.
    *   **Test Case AD-CT-019:** Displays correct information in each tab (Personal, Documents, Interview, Visa - if applicable).
        *   **Setup:** Mount with a comprehensive mock applicant object covering all data points.
        *   **Assertions:** Switch between tabs and verify the content of each tab matches the mock applicant's data. Check for "N/A" or empty states for optional data.
    *   **Test Case AD-CT-020:** "Upload Document (Mock)" button is present in Documents tab.
        *   **Assertions:** Verify button presence (functionality is mock).
    *   **Test Case AD-CT-021:** Mock status change buttons are present in Status & Actions tab.
        *   **Assertions:** Verify button presence (functionality is mock).

*   **`NewApplicationForm.tsx`:**
    *   **Test Case AD-CT-022:** Renders all form fields correctly (First Name, Last Name, Email, Phone, DOB, Program).
        *   **Setup:** Mount component with `visible={true}`.
        *   **Assertions:** Verify all input fields, select, and date picker are present with correct labels.
    *   **Test Case AD-CT-023:** Shows validation errors for required fields.
        *   **Setup:** Mount and attempt to submit the form with empty required fields.
        *   **Assertions:** Verify validation error messages appear next to the respective fields.
    *   **Test Case AD-CT-024:** Shows validation error for invalid email format.
        *   **Setup:** Enter an invalid email and attempt submission or trigger blur.
        *   **Assertions:** Verify email validation message.
    *   **Test Case AD-CT-025:** Calls `onAddApplicant` prop with correct applicant data on successful submission.
        *   **Setup:** Mount with a mock `onAddApplicant` function. Fill form with valid data.
        *   **Assertions:** Simulate form submission. Verify `onAddApplicant` was called with an applicant object containing the form values and generated defaults.
    *   **Test Case AD-CT-026:** Calls `onClose` prop when "Cancel" button is clicked or modal is closed.
        *   **Setup:** Mount with mock `onClose`.
        *   **Assertions:** Simulate click on "Cancel" button. Verify `onClose` was called.
    *   **Test Case AD-CT-027:** Form resets after successful submission (or when closed if `destroyOnClose` is effective).
        *   **Setup:** Fill form, submit successfully. Reopen form.
        *   **Assertions:** Verify fields are empty or reset to defaults.

### 2.3. Integration Test Scenarios (Conceptual)

*   **AD-IT-001:** Filtering `ApplicantTable` (e.g., by status) correctly updates the displayed list of applicants.
    *   **Steps:** 1. Load dashboard. 2. Apply a status filter on the table.
    *   **Expected:** Table rows update to show only applicants matching the selected status.
*   **AD-IT-002:** Adding a new applicant via `NewApplicationForm` updates the `ApplicantTable` and the "Total Applicants" KPI.
    *   **Steps:** 1. Note initial total applicants KPI and table row count. 2. Open and submit "New Application" form.
    *   **Expected:** New applicant appears in the table. "Total Applicants" KPI increments by one. Funnel chart's "Applied" stage count (if visible and using live data) increments.
*   **AD-IT-003:** Clicking the "View Details" action in a row of `ApplicantTable` opens `ApplicantDetailModal` displaying the data for the correct applicant.
    *   **Steps:** 1. Identify an applicant in the table. 2. Click their "View Details" button.
    *   **Expected:** Modal opens. Data in the modal (name, email, etc.) matches the selected applicant.
*   **AD-IT-004 (If KPIs were dynamic):** If KPIs were designed to reflect the filtered table data, verify that applying filters to `ApplicantTable` also updates the KPI cards accordingly. (Current implementation has global KPIs).

### 2.4. End-to-End (E2E) Test Scenarios (Conceptual)

*   **Scenario AD-E2E-001: Full New Applicant Onboarding and Verification**
    1.  **Navigate:** User navigates to the Admissions Dashboard.
    2.  **Verify Initial State:** Dashboard loads, KPI tiles show initial aggregate data (e.g., Total Applicants > 0). Applicant Funnel chart and Key Deadlines Timeline are visible. Applicant Table displays a list of applicants.
    3.  **Open New Application Form:** User clicks the "New Application" button.
    4.  **Fill Form:** User fills in all required fields (First Name, Last Name, Email, DOB, Program) with valid data.
    5.  **Submit Form:** User clicks "Submit Application".
    6.  **Verify Success:**
        *   A success message ("New application added successfully!") appears.
        *   The "New Application" modal closes.
    7.  **Verify Table Update:** The newly added applicant appears as the first row (or correctly sorted if default sort exists) in the `ApplicantTable`. Data in the row matches submitted data.
    8.  **Verify KPI Update:** The "Total Applicants" KPI tile increments by one.
    9.  **Verify Funnel Chart Update (Conceptual):** The "Applied" stage of the funnel chart count increments by one.
    10. **Filter for New Applicant:** User uses the text search in `ApplicantTable` to find the newly added applicant by name or email.
    11. **Verify Filter Result:** Only the new applicant (or relevant matches) are shown in the table.
    12. **View Applicant Details:** User clicks the "View Details" button for the new applicant.
    13. **Verify Modal Data:** `ApplicantDetailModal` opens. Information in the "Personal" tab matches the submitted and default-generated data for the new applicant. Check other tabs for default/empty states (e.g., no documents, no interview).
    14. **Close Modal:** User closes the detail modal.

*   **Scenario AD-E2E-002: Comprehensive Filtering and Sorting of Applicants**
    1.  **Navigate:** User navigates to the Admissions Dashboard.
    2.  **Text Search:** User enters a known partial first name (e.g., "John") into the table's search box.
    3.  **Verify Text Search:** Table updates to show only applicants whose first or last name, program, or ID contains "John".
    4.  **Status Filter:** User selects "Shortlisted" and "Offered" from the status filter dropdown.
    5.  **Verify Status Filter:** Table updates to show only applicants matching the search term AND having either "Shortlisted" or "Offered" status.
    6.  **Date Range Filter:** User selects a specific application date range using the date picker.
    7.  **Verify Date Range Filter:** Table updates to show only applicants matching all active filters (text, status, date range).
    8.  **Sort by Name:** User clicks the "Name" column header to sort applicants alphabetically.
    9.  **Verify Sort:** Table sorts A-Z. User clicks again. Table sorts Z-A.
    10. **Sort by Application Date:** User clicks the "Application Date" column header.
    11. **Verify Sort:** Table sorts by date (ascending). User clicks again. Table sorts by date (descending).
    12. **Clear Filters:** User clears each filter one by one (e.g., clear text search, deselect statuses, clear date range from dashboard controls if they exist, or from table controls).
    13. **Verify Table Reset:** Table reverts to showing all applicants (or respecting any remaining filters).

*   **Scenario AD-E2E-003: Language Switching (Internationalization)**
    1.  **Navigate:** User navigates to the Admissions Dashboard. All text is in the default language (e.g., English).
    2.  **Switch Language:** User selects "Spanish" from the language switcher in the global header.
    3.  **Verify Dashboard Translation:**
        *   Dashboard title ("Admissions Dashboard" -> "Tablero de Admisiones").
        *   KPI tile titles.
        *   Chart titles (Funnel, Deadlines).
        *   `ApplicantTable` column headers, filter placeholders, button texts.
        *   "New Application" button text.
    4.  **Interact in New Language:** User opens the "New Application" form.
    5.  **Verify Form Translation:** All form labels, placeholders, and button texts within the modal are in Spanish. Validation messages (if triggered) appear in Spanish.
    6.  **Switch Language Back:** User selects "English" from the language switcher.
    7.  **Verify Reversion:** All text elements revert to English.

## 3. Test Plan: Attendance Tracking Dashboard

This section details the test cases for the Attendance Tracking Dashboard.

### 3.1. Unit Test Cases

*   **`src/utils/mockData/attendance/generateMockAttendanceData.ts`:**
    *   **Test Case AT-UT-001:** Verify `generateMockStudents()` creates student objects matching the `Student` interface.
        *   **Assertions:** Check for presence and types of `id`, `firstName`, `lastName`.
    *   **Test Case AT-UT-002:** Verify `generateMockClasses()` creates class objects matching the `SchoolClass` interface.
        *   **Assertions:** Check for presence and types of `id`, `name`, `subject`.
    *   **Test Case AT-UT-003:** Verify `generateMockAttendanceRecords()` creates records matching `AttendanceRecord` interface.
        *   **Assertions:** Check for `id`, `studentId`, `classId`, `date`, `status`. Ensure `date` is a valid ISO string. Ensure `absenceReason` is present if status is 'Absent' or 'Excused' (based on generation logic).
    *   **Test Case AT-UT-004:** Verify `generateMockAttendanceRecords()` generates records within a reasonable date range (e.g., covering the specified number of past days, excluding weekends if logic implemented).
*   **`src/components/AttendanceDashboard/AttendanceDashboard.tsx` (KPI and Alert Calculation Logic):**
    *   **Test Case AT-UT-005:** Test KPI calculation logic (`kpiData` useMemo hook) with various mock attendance datasets.
        *   **Input:** Arrays of `AttendanceRecord` objects.
        *   **Assertions:**
            *   Verify `overallAttendanceRate` calculation.
            *   Verify `absencesToday`, `lateToday`, `excusedToday` counts based on current date.
    *   **Test Case AT-UT-006:** Test `irregularAttendanceAlerts` logic.
        *   **Input:** `filteredAttendanceRecords` and `allStudents` data.
        *   **Assertions:**
            *   Students with >3 absences in the last 7 days are correctly identified.
            *   Students with >5 lates in the last 14 days are correctly identified.
            *   No alerts generated for students not meeting criteria.
            *   Correct alert reasons are generated.
        *   **Note:** This logic is complex and prime for extraction into a pure, testable utility function.

### 3.2. Component Test Cases (React Testing Library Concepts)

*   **`KpiCard` (reused or similar to Admissions module):**
    *   **Test Case AT-CT-001:** Renders title and value; handles loading state.
*   **Dashboard Filters (within `AttendanceDashboard.tsx`):**
    *   **Test Case AT-CT-002:** Student, Class, and Date Range selectors render with options (if applicable) and placeholders.
    *   **Test Case AT-CT-003:** Selecting a student updates component state / triggers callback.
    *   **Test Case AT-CT-004:** Selecting a class updates component state / triggers callback.
    *   **Test Case AT-CT-005:** Selecting a date range updates component state / triggers callback.
    *   **Test Case AT-CT-006:** Active filter tags render correctly when filters are applied.
    *   **Test Case AT-CT-007:** Clicking "Clear Filters" button resets filter states.
    *   **Test Case AT-CT-008:** Dismissing an active filter tag updates the corresponding filter state.

*   **`AttendanceCalendarHeatmap.tsx`:**
    *   **Test Case AT-CT-009:** Renders Nivo Calendar; displays data for the correct year.
    *   **Test Case AT-CT-010:** Data points (days) are colored according to attendance status/density.
    *   **Test Case AT-CT-011:** Tooltip shows correct summary for a day on hover.
    *   **Test Case AT-CT-012:** Handles empty/loading states.

*   **`AbsenceReasonChart.tsx`:**
    *   **Test Case AT-CT-013:** Renders Nivo Bar chart; aggregates and displays absence reasons correctly.
    *   **Test Case AT-CT-014:** Bars represent correct counts for each reason. X-axis (reasons) and Y-axis (counts) are labeled.
    *   **Test Case AT-CT-015:** Handles empty/loading states.

*   **`WeeklyAttendanceTrendChart.tsx`:**
    *   **Test Case AT-CT-016:** Renders Nivo Line chart; displays weekly attendance rate trend.
    *   **Test Case AT-CT-017:** Data points correctly represent weekly present rate percentage. X-axis (weeks) and Y-axis (rate %) are labeled.
    *   **Test Case AT-CT-018:** Handles empty/loading states (e.g., "Not enough data for weekly trend").

*   **`AttendanceLogTable.tsx`:**
    *   **Test Case AT-CT-019:** Renders table with correct columns (Date, Student, Class, Status, Reason, Notes, Actions) and data.
    *   **Test Case AT-CT-020:** Student and Class names are correctly mapped from IDs.
    *   **Test Case AT-CT-021:** Pagination, client-side sorting (by date, student name, class name, status), and local table filters (text search, status, date) work.
    *   **Test Case AT-CT-022:** "Edit Record" button calls `onEditRecord` prop with correct record data.
    *   **Test Case AT-CT-023:** Status tags display correct colors and translated text.

*   **`MarkAttendanceForm.tsx`:**
    *   **Test Case AT-CT-024:** Renders correctly for "New" mode (empty fields, Student/Class/Date enabled).
    *   **Test Case AT-CT-025:** Renders correctly for "Edit" mode (fields pre-filled, Student/Class/Date disabled). `useEffect` correctly sets initial values.
    *   **Test Case AT-CT-026:** Validation for required fields (Student, Class, Date, Status, Reason if applicable) works.
    *   **Test Case AT-CT-027:** `onSave` is called with correct `AttendanceRecord` data on submit (for both new and edit).
    *   **Test Case AT-CT-028:** `onClose` is called when "Cancel" or modal X is clicked.
    *   **Test Case AT-CT-029:** Reason field appears conditionally based on selected status.

*   **`IrregularAttendanceAlerts` section (within `AttendanceDashboard.tsx`):**
    *   **Test Case AT-CT-030:** Renders a list of students matching alert criteria.
        *   **Setup:** Provide mock `filteredAttendanceRecords` and `allStudents` that trigger alerts.
        *   **Assertions:** Verify flagged students' names and alert reasons are displayed.
    *   **Test Case AT-CT-031:** Shows "No alerts" message when no students meet criteria.
    *   **Test Case AT-CT-032:** Handles loading state.

### 2.3. Integration Test Scenarios (Conceptual)

*   **AT-IT-001:** Changing dashboard filters (Student, Class, Date Range) updates the data displayed in `AttendanceCalendarHeatmap`, `AbsenceReasonChart`, `WeeklyAttendanceTrendChart`, `AttendanceLogTable`, and `IrregularAttendanceAlerts` section.
    *   **Steps:** 1. Load dashboard. 2. Apply a student filter.
    *   **Expected:** All data-driven components update to reflect only the selected student's data.
*   **AT-IT-002:** Adding a new attendance record via `MarkAttendanceForm` updates the `AttendanceLogTable`. If KPIs/charts use `allAttendanceRecords` (which is updated), they should also reflect the change.
    *   **Steps:** 1. Open "Mark Attendance" form. 2. Submit a new record.
    *   **Expected:** New record appears in the table. KPIs and charts update.
*   **AT-IT-003:** Editing an attendance record via `MarkAttendanceForm` (opened from `AttendanceLogTable`) updates the record in the table and other relevant components.
    *   **Steps:** 1. Click "Edit" on a table row. 2. Change status in the form and save.
    *   **Expected:** Record is updated in the table. KPIs/charts reflect the change.
*   **AT-IT-004:** Local filters within `AttendanceLogTable` further refine the list of records shown in the table, independent of dashboard-level filters (but operating on the data already filtered by dashboard).
    *   **Steps:** 1. Apply a dashboard filter (e.g., for a class). 2. In the table, apply a status filter.
    *   **Expected:** Table shows records for the selected class AND the selected status.

### 2.4. End-to-End (E2E) Test Scenarios (Conceptual)

*   **Scenario AT-E2E-001: Record, View, and Update Attendance**
    1.  **Navigate:** User navigates to Attendance Dashboard.
    2.  **Verify Initial State:** KPIs, charts, and table load with initial data.
    3.  **Select Filters:** User selects a specific Student and Class from dashboard filters.
    4.  **Verify Filtered View:** All charts and the table update to show data only for the selected student and class.
    5.  **Mark New Attendance:** User clicks "Mark Attendance" button.
    6.  **Fill Form:** Form opens. Student and Class might be pre-filled if context allows, or user selects them. User selects today's date, status "Present".
    7.  **Submit Form:** User submits the form.
    8.  **Verify Record:** New record appears in `AttendanceLogTable`. Success message shown. KPIs/charts potentially update.
    9.  **Edit Attendance:** User finds the newly added record in the table and clicks "Edit".
    10. **Modify Record:** `MarkAttendanceForm` opens pre-filled. User changes status to "Late" and adds a reason "Traffic".
    11. **Save Changes:** User submits the form.
    12. **Verify Update:** Record in `AttendanceLogTable` updates to "Late" with the reason. Success message shown. KPIs/charts potentially update.

*   **Scenario AT-E2E-002: Investigate Irregular Attendance**
    1.  **Navigate:** User navigates to Attendance Dashboard.
    2.  **Apply Broad Filters:** User selects a date range covering the last month.
    3.  **Check Alerts:** User reviews the "Irregular Attendance Alerts" section.
    4.  **Identify Alerted Student:** User notes a student listed in alerts (e.g., "John Doe - 4 absences in last 7 days").
    5.  **Filter for Alerted Student:** User selects "John Doe" from the main student filter.
    6.  **Verify Data:**
        *   `AttendanceCalendarHeatmap` highlights days of absence/lateness for John Doe.
        *   `AbsenceReasonChart` might show common reasons if John Doe's data dominates.
        *   `AttendanceLogTable` lists John Doe's attendance records, confirming the absences.
    7.  **Cross-Reference with Calendar:** User visually cross-references absences in the table with the heatmap.

*   **Scenario AT-E2E-003: Language Switching (Internationalization)**
    1.  **Navigate:** User navigates to Attendance Dashboard (default language).
    2.  **Switch Language:** User selects "Spanish" from the global language switcher.
    3.  **Verify Dashboard Translation:** All titles, KPI labels, filter labels, chart legends/axis labels, table headers, button texts in the Attendance Dashboard are in Spanish.
    4.  **Open Mark Attendance Form:** User clicks "Mark Attendance".
    5.  **Verify Form Translation:** All form labels, placeholders, radio button text, and validation messages in the form are in Spanish.
    6.  **Switch Back:** User selects "English" from the language switcher.
    7.  **Verify Reversion:** All text reverts to English.

## 4. General Test Considerations

This section outlines general testing considerations applicable across all modules of the Student Information System.

### 4.1. Internationalization (i18n)

*   **Objective:** Ensure the application is fully usable and understandable in all supported languages (currently English and Spanish).
*   **Test Cases (Conceptual - apply per module/component):**
    *   **GC-I18N-001: Language Switching:**
        *   Verify that switching the language via the global language switcher updates all UI text elements on the currently visible page to the selected language. This includes titles, labels, button texts, table headers, placeholders, messages, and chart elements (legends, tooltips, axis labels).
    *   **GC-I18N-002: Correct Translations:**
        *   Verify that translations are accurate, contextually appropriate, and free of grammatical errors for both English and Spanish. (This would typically involve review by native speakers or localization experts).
    *   **GC-I18N-003: Date, Number, and Currency Formatting (Future Consideration):**
        *   As the application evolves to include more locale-sensitive data, verify that dates, numbers, and currencies are formatted according to the conventions of the selected language/locale. (Ant Design's locale provider handles some of this for its components).
    *   **GC-I18N-004: Text Expansion/Contraction:**
        *   Verify that the UI layout handles variations in text length due to translation without breaking or causing text to be truncated. (e.g., Spanish text can be longer than English).
    *   **GC-I18N-005: Default Language:**
        *   Verify the application loads in a default language (e.g., English) if no language preference is detected or set.

### 4.2. Responsiveness

*   **Objective:** Ensure the application provides a usable experience across various screen sizes and devices (desktop, tablet, mobile).
*   **Test Cases (Conceptual - apply per module/page):**
    *   **GC-RWD-001: Layout Adaptation (Desktop, Tablet, Mobile Views):**
        *   Verify that the layout adjusts appropriately for common breakpoints. Check for:
            *   Navigation (sidebar/header) behavior.
            *   Grid and column stacking.
            *   Readability of text and visibility of images/icons.
            *   Absence of horizontal scrolling where not intended.
    *   **GC-RWD-002: Interactive Element Usability:**
        *   Verify that buttons, forms, dropdowns, and other interactive elements are easily tappable/clickable and usable on smaller screens.
    *   **GC-RWD-003: Table Responsiveness:**
        *   Verify that tables with many columns are horizontally scrollable on smaller screens (e.g., Ant Design Table's `scroll={{ x: 'max-content' }}` behavior).
    *   **GC-RWD-004: Chart Readability:**
        *   Verify that Nivo charts are responsive and remain readable on smaller screens. Tooltips and legends should not obscure critical information or break the layout. (Nivo's `Responsive` variants help here).
    *   **GC-RWD-005: Modal Dialogs:**
        *   Verify that modal dialogs are centered, appropriately sized, and scrollable if content exceeds viewport height on smaller screens.

### 4.3. Accessibility (WCAG 2.1 AA Compliance - Conceptual)

*   **Objective:** Ensure the application is accessible to users with disabilities, aiming for WCAG 2.1 Level AA compliance.
*   **Test Cases (Conceptual - apply per module/component):**
    *   **GC-A11Y-001: Keyboard Navigation:**
        *   Verify all interactive elements (links, buttons, form fields, tabs, table controls, modals) are focusable and operable using only the keyboard.
        *   Check for logical focus order.
        *   Ensure visible focus indicators.
    *   **GC-A11Y-002: Screen Reader Compatibility:**
        *   Verify that content is announced correctly by screen readers (e.g., NVDA, VoiceOver).
        *   Check for appropriate ARIA attributes (roles, states, properties) where needed, especially for custom components or complex interactions. (Ant Design components generally provide good ARIA support).
        *   Ensure images have alt text (if meaningful) or are marked as decorative.
    *   **GC-A11Y-003: Color Contrast:**
        *   Verify that text and interactive elements have sufficient color contrast against their background (aim for 4.5:1 for normal text, 3:1 for large text).
    *   **GC-A11Y-004: Form Labels and Instructions:**
        *   Verify all form fields have clear, programmatically associated labels.
        *   Ensure instructions and validation error messages are clear and accessible.
    *   **GC-A11Y-005: Semantic HTML:**
        *   Verify appropriate use of semantic HTML elements (headings, lists, landmarks) to structure content.
    *   **GC-A11Y-006: Modal Accessibility:**
        *   Verify modals trap focus correctly and that background content is inert when a modal is open.
        *   Ensure modals can be closed via keyboard (e.g., Escape key).

### 4.4. Error Handling & Empty States

*   **Objective:** Ensure the application handles errors gracefully and provides clear feedback to the user.
*   **Test Cases (Conceptual - apply per module/component):**
    *   **GC-ERR-001: Form Validation Messages:**
        *   Verify that clear, specific validation messages are displayed for invalid form inputs.
    *   **GC-ERR-002: Loading States:**
        *   Verify that loading indicators (e.g., spinners) are displayed during data fetching or when components are processing data.
    *   **GC-ERR-003: Empty States:**
        *   Verify that user-friendly messages or visual cues are displayed when there is no data to show in tables, charts, or lists (e.g., "No applicants found," "No attendance records for this period").
    *   **GC-ERR-004: Mock API/Action Feedback (Conceptual):**
        *   For mock actions (e.g., submitting a form that updates client-side data), verify that success or mock failure messages are displayed appropriately using Ant Design `message` or `notification` components.

### 4.5. Usability (General Heuristics)

*   **Objective:** Ensure the application is intuitive and easy to use.
*   **Test Cases (Conceptual - general review points):**
    *   **GC-USAB-001: Consistency:** Verify consistent design patterns, terminology, and component behavior across the application.
    *   **GC-USAB-002: Feedback:** Ensure the system provides feedback for user actions (e.g., button clicks, form submissions).
    *   **GC-USAB-003: Clarity:** Verify that information is presented clearly and that UI elements are easy to understand.
    *   **GC-USAB-004: Efficiency:** Ensure common tasks can be completed efficiently with minimal steps.

This general considerations section should be referenced when creating specific test cases for new modules or features.

[end of TESTING_PLAN.md]

[end of TESTING_PLAN.md]
