import api from "../auth/auth.service";
import type {
  CreateProcedureData,
  ProcedureResponse,
  UpdateProcedureData,
} from "./procedures.types";


export const procedureService = {
  // ✅ GET: Fetch all procedure templates
  fetchProcedures: async (): Promise<ProcedureResponse[]> => {
    const res = await api.get(`procedures`);
    return res.data.items;
  },

  // ✅ GET: Fetch a single procedure template by ID
  fetchProcedureById: async (id: string): Promise<ProcedureResponse> => {
    // API: GET /procedures/{id}
    const res = await api.get(`procedures/${id}`);
    return res.data;
  },

  // ✅ POST: Create a new procedure template
  createProcedure: async (
    data: CreateProcedureData
  ): Promise<ProcedureResponse> => {
    // API: POST /procedures
    const res = await api.post(`procedures`, data);
    return res.data;
  },

  //  PATCH: Update an existing procedure template
  updateProcedure: async (
    id: string,
    data: UpdateProcedureData
  ): Promise<ProcedureResponse> => {
    // API: PATCH /procedures/{id}
    const res = await api.patch(`procedures/${id}`, data);
    return res.data;
  },

  // ✅ DELETE: Delete a procedure template
  deleteProcedure: async (id: string): Promise<void> => {
    // API: DELETE /procedures/{id}
    await api.delete(`procedures/${id}`);
  },

  // ✅ POST: Duplicate an existing procedure template
  duplicateProcedure: async (id: string): Promise<ProcedureResponse> => {
    // API: POST /procedures/{id}/duplicate
    const res = await api.post(`procedures/${id}/duplicate`);
    return res.data; // Returns the new duplicated procedure
  },

  // ✅ DELETE: Delete multiple procedures
  batchDeleteProcedures: async (ids: string[]): Promise<void> => {
    // API: DELETE /procedures/batch-delete
    await api.delete(`procedures/batch-delete`, {
      data: { ids: ids },
    });
  },


  /**
   * Fetches all soft-deleted procedure templates.
   * @returns {Promise<ProcedureResponse[]>}
   */
  fetchDeletedProcedures: async (): Promise<ProcedureResponse[]> => {
    // API: GET /procedures/deleted/all
    const res = await api.get(`procedures/deleted/all`);
    return res.data;
  },

  // --- 👇 [CHANGE] YEH NAYA FUNCTION ADD KIYA GAYA HAI ---
  /**
   * Restores a soft-deleted procedure template.
   * @param {string} id - The ID of the procedure to restore.
   * @returns {Promise<ProcedureResponse>} The restored procedure.
   */
  restoreProcedure: async (id: string): Promise<ProcedureResponse> => {
    // API: PATCH /procedures/{id}/restore
    const res = await api.patch(`procedures/${id}/restore`);
    return res.data;
  },
  // --- END OF NEW FUNCTION ---
};