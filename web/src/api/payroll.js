import client from "./client.js";

const data = (p) => p.then((r) => r.data);

// Salary Structures
export const getSalaryStructure = (employeeId) =>
  data(client.get(`/payroll/structures/${employeeId}`));

export const saveSalaryStructure = (employeeId, body) =>
  data(client.put(`/payroll/structures/${employeeId}`, body));

// Payroll Processing (HR / Admin)
export const getPayrollDraft = (params) =>
  data(client.get("/payroll/draft", { params }));

export const runPayroll = (body) => data(client.post("/payroll/run", body));

export const finalizePayroll = (id, body) =>
  data(client.patch(`/payroll/${id}/finalize`, body));

export const listPayrolls = (params) =>
  data(client.get("/payroll", { params }));

// Payslips (Employee & HR)
export const getMyPayslips = (params) =>
  data(client.get("/payroll/payslips/mine", { params }));

export const getPayslipPdf = (payslipId) =>
  client.get(`/payroll/payslips/${payslipId}/pdf`, { responseType: "blob" });
