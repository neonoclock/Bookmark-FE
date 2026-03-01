export function isUnauthorizedError(error) {
  const code = error?.payload?.code ?? error?.code;
  const status = error?.status;
  return (
    status === 401 ||
    status === 403 ||
    code === "UNAUTHORIZED" ||
    code === "FORBIDDEN" ||
    code === "unauthorized"
  );
}
