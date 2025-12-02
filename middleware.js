// import { NextResponse } from "next/server";

const { auth } = require("./app/_lib/auth");

// export function middleware(request) {
//   console.log(request);
//   //This creates an infinite loop of redirects because , by default the middleware
//   // runs for every single route.
//   //to make it stop : run it for certain routes (matcher)
//   //   return NextResponse.redirect(new URL("/about", request.url));
//   return NextResponse.redirect(new URL("/about", request.url));
// }

// export const config = {
//   //only /account will br redirected to /about
//   matcher: ["/account"],
// };

//servies as middleware too
export const middleware = auth;
export const config = {
  //only protect /account
  matcher: ["/account"],
};
