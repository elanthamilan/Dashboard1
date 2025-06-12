# School Dashboard

This project is a school dashboard application built with React, TypeScript, and Vite.

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in the development mode.\
Open [http://localhost:5173](http://localhost:5173) (or another port if 5173 is in use) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `dist` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

### `npm run serve`

Serves the built app from the `dist` folder. This is a way to test the production build locally.

## Learn More

You can learn more in the [Vite documentation](https://vitejs.dev/guide/).

To learn React, check out the [React documentation](https://reactjs.org/).

## Project Status & Data Integration

This application has recently undergone a refactoring to streamline its components. Older, duplicated dashboard views have been removed in favor of the integrated modules within the "Principal View".

**Current Data Source:** The application presently uses **mock data** for all dashboards and visualizations. This is hardcoded within the `src/utils/mockData/` directory and called directly from the components.

**Integrating Real Data:** To connect this application to a live backend or real data sources, developers will need to:
   - Modify the `useEffect` hooks within the primary module components (e.g., `src/components/PrincipalView/modules/AdmissionsModule.tsx`, `AttendanceEngagementModule.tsx`, etc.).
   - Replace the calls to mock data generation functions (e.g., `generateMockApplicants(...)`) with actual API calls (e.g., using `fetch` or `axios`) to your backend services.
   - An example of this pattern (commented out) has been provided in `src/components/PrincipalView/modules/AdmissionsModule.tsx` to guide this process.
   - Ensure the data returned from your API matches the TypeScript types expected by the components (defined in `src/types/` and within component files).