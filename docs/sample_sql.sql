CREATE DATABASE employee_management;
GO

USE employee_management;
GO

INSERT INTO roles (name, description, created_at, updated_at)
VALUES
  ('Admin', 'System administrator', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
  ('Manager', 'Project and expense approver', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
  ('Employee', 'Task and expense submitter', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
GO

SELECT u.id, u.email, u.full_name, r.name AS role_name
FROM users u
JOIN roles r ON r.id = u.role_id
WHERE u.is_deleted = 0;
GO

SELECT e.status, COUNT(*) AS expense_count, SUM(e.amount) AS total_amount
FROM expenses e
WHERE e.is_deleted = 0
GROUP BY e.status;
GO

