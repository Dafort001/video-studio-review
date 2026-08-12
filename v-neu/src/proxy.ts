import NextAuth from "next-auth"
import { verifyTempAdminToken, TEMP_ADMIN_COOKIE_NAME } from "@/lib/temp-admin";
import { hasAuthenticatedUser } from "@/lib/auth-security";
import { authConfig } from "./auth.config"

const { auth } = NextAuth(authConfig)

export default auth(async (req) => {
    const tempAdminPayload = await verifyTempAdminToken(
        req.cookies.get(TEMP_ADMIN_COOKIE_NAME)?.value
    )
    // Auth.js configuration errors used to populate req.auth with a truthy
    // error object. Require the identity that our JWT callback attaches so a
    // broken auth configuration cannot make protected routes fail open.
    const hasRealSession = hasAuthenticatedUser(req.auth)
    const hasTempAdminSession = !hasRealSession && !!tempAdminPayload
    const isLoggedIn = hasRealSession || hasTempAdminSession
    const path = req.nextUrl.pathname

    // Public Routes
    if (
        path.startsWith("/sign-in") ||
        path.startsWith("/pi") ||
        path.startsWith("/editor/share") ||
        path.startsWith("/api/auth") ||
        path.startsWith("/api/webhooks") ||
        path.startsWith("/auth/admin-beta")
    ) {
        return
    }

    // Protected Routes
    if (!isLoggedIn && (path.startsWith("/dashboard") || path.startsWith("/editor"))) {
        return Response.redirect(new URL("/auth/signin", req.nextUrl))
    }

    if (
        path.startsWith("/dashboard/admin") &&
        req.auth?.user?.role !== "admin" &&
        !hasTempAdminSession
    ) {
        return Response.redirect(new URL("/dashboard", req.nextUrl))
    }

    // Onboarding Redirect
    if (isLoggedIn && req.auth?.user?.needsProfileUpdate && !hasTempAdminSession) {
        // Allow access to the profile page itself, and API routes like logout
        if (path.startsWith("/dashboard") && path !== "/dashboard/profile" && !path.startsWith("/api/auth")) {
            return Response.redirect(new URL("/dashboard/profile", req.nextUrl))
        }
    }
})

export const config = {
    matcher: ["/dashboard/:path*", "/editor/:path*"],
}
