# Fix: Invisimart Pod Health Issue (Remote Access)

## Issue
When accessing Invisimart on a GCP VM (Instruqt environment) from a browser, the admin section showed "0/4 components healthy" and no products were displayed, even though the same code worked correctly on a local Mac.

## Root Cause
The frontend was configured with `API_URL=http://localhost:8080` for client-side browser requests. This works on Mac with Docker Desktop due to special networking, but fails when accessed remotely because:
- The browser runs on the user's machine (not the VM)
- `localhost` in the browser context refers to the user's machine
- The API at `localhost:8080` is not accessible from the user's browser

## Solution
Modified all frontend components to detect when the API URL is `localhost` or null, and dynamically construct it from `window.location`:

```javascript
if (!config.apiUrl || config.apiUrl.includes('localhost')) {
  // Use the same protocol and hostname as the frontend, but port 8080
  const apiUrl = `${window.location.protocol}//${window.location.hostname}:8080`;
  setApiUrl(apiUrl);
} else {
  setApiUrl(config.apiUrl);
}
```

This enables the app to work in both:
- **Local development**: Docker Desktop with `http://localhost:8080`
- **Remote access**: Instruqt/cloud VMs where API URL is constructed dynamically (e.g., `https://vault-server.kooarnfirbgq.svc.cluster.local:8080`)

## Files Changed
1. `frontend/src/components/ApplicationHealth.tsx` - Health check component
2. `frontend/src/components/InventoryList.tsx` - Inventory display
3. `frontend/src/components/AdminDashboard.tsx` - Admin dashboard
4. `frontend/src/components/ProductList.tsx` - Main product listing
5. `frontend/src/app/products/[id]/page.tsx` - Product detail page
6. `frontend/src/app/admin/events/page.tsx` - Admin events page
7. `frontend/src/app/checkout/page.tsx` - Checkout flow
8. `frontend/src/app/confirmation/page.tsx` - Order confirmation

## Testing
After rebuilding the frontend:
- ✅ All 4 Docker containers running and healthy
- ✅ API endpoints responding correctly (health, products, inventory)
- ✅ Frontend starts without errors
- ✅ Dynamic API URL construction working in all components

## Key Insight
This issue highlights the difference between:
- **Server-side API calls** (from Next.js server): Use Docker network names like `http://api:8080`
- **Client-side API calls** (from browser JavaScript): Must use the browser's accessible hostname/IP

The fix ensures client-side calls automatically adapt to the environment they're running in.
