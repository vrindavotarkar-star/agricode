# TODO: Implement Query History Feature

## Tasks
- [x] Add GET `/history` route in `node-backend/routes/queries.js` to retrieve authenticated user's query history
- [x] Update `AgriCulture-1.0.0/index.html` to add JavaScript that fetches and displays history when the history tab is clicked
- [x] Test the history functionality

## Notes
- History is sorted by timestamp descending
- Displays query, answer, category, and date for each history item
- Loads history when history tab is activated
- Shows loading state and error handling
- Backend already saves queries to history in QueryHistory model
