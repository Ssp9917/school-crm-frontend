import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedBranch: "",
};

const branchSlice = createSlice({
  name: 'branch',
  initialState,
  reducers: {
    setSelectedBranch(state, action) {
      state.selectedBranch = action.payload;
    },
  },
});

export const { setSelectedBranch } = branchSlice.actions;
export default branchSlice.reducer;
