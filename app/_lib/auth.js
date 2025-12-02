import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { createGuest, getGuest } from "./data-service";

const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    authorized({ auth, request }) {
      // !!auth?.user; => a trick to convert a value to boolean
      return auth?.user ? true : false;
    },
    //this callback runs befor the actual signup process happens
    //we can perform all the operations associated to sign in here
    async signIn({ user, account, profile }) {
      try {
        //to check if a user exists or not
        const existingGuest = await getGuest(user.email);

        if (!existingGuest) {
          await createGuest({ email: user.email, fullName: user.name });
        }
        return true;
      } catch {
        //the user will not be logged in
        return false;
      }
    },
    //runs after the signin callback
    // should perform sign in first then the session
    async session({ session, user }) {
      const guest = await getGuest(session.user.email);
      session.user.guestId = guest.id;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
export const {
  //route handler functions
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authConfig);
