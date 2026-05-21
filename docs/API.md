# API Documentation

Base URL: `http://localhost:8000/api/v1`

Authentication uses JWT bearer tokens. Call `POST /auth/login`, then send:

```http
Authorization: Bearer <access_token>
```

## Main Endpoints

| Module | Endpoints |
| --- | --- |
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `GET /auth/me` |
| Roles | `GET /roles`, `POST /roles`, `GET /roles/{role_id}`, `PUT /roles/{role_id}`, `DELETE /roles/{role_id}` |
| Users | `GET /users`, `POST /users`, `GET /users/{user_id}`, `PUT /users/{user_id}`, `DELETE /users/{user_id}` |
| Projects | `GET /projects`, `POST /projects`, `GET /projects/{project_id}`, `PUT /projects/{project_id}`, `DELETE /projects/{project_id}` |
| Tasks | `GET /tasks`, `POST /tasks`, `PUT /tasks/{task_id}`, `PATCH /tasks/{task_id}/status`, `DELETE /tasks/{task_id}` |
| Expenses | `GET /expenses`, `POST /expenses`, `PUT /expenses/{expense_id}`, `POST /expenses/{expense_id}/bill`, `PATCH /expenses/{expense_id}/decision`, `DELETE /expenses/{expense_id}` |
| Notifications | `GET /notifications`, `POST /notifications`, `PATCH /notifications/{notification_id}/read` |
| Reports | `GET /dashboard/summary`, `GET /reports/expenses`, `GET /reports/projects` |

List endpoints support:

```http
?page=1&size=20&search=demo&sort_by=id&sort_order=desc
```

Interactive Swagger UI is available at `/docs`.

## Frontend Page Mapping

The admin roles page should use the existing admin-protected roles APIs:

```text
/admin/roles -> GET /roles, POST /roles, GET /roles/{role_id}, PUT /roles/{role_id}, DELETE /roles/{role_id}
```

Password recovery pages should use:

```text
/forgot-password -> POST /auth/forgot-password
/reset-password -> POST /auth/reset-password
```
