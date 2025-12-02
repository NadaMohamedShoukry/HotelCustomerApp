"use server";

import { revalidatePath } from "next/cache";

import { auth, signIn, signOut } from "./auth";
import { supabase } from "./supabase";
import { rangeOverlaps } from "react-day-picker";
import { redirect } from "next/navigation";
import { getBookings } from "./data-service";

export async function signInAction() {
  await signIn("google", {
    redirectTo: "/account",
  });
}

export async function signOutAction() {
  await signOut({
    redirectTo: "/",
  });
}

export async function updateGuestProfile(formData) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in!");
  const nationalID = formData.get("nationalID");
  const [nationality, countryFlag] = formData.get("nationality").split("%");
  if (!/^[a-zA-Z)-9]{6,12}$/.test(nationalID))
    throw new Error("Please provide a valid national ID");
  const updateData = { nationalID, nationality, countryFlag };

  const { data, error } = await supabase
    .from("guests")
    .update(updateData)
    .eq("id", session.user.guestId);

  if (error) {
    console.error(error);
    throw new Error("Guest could not be updated");
  }

  revalidatePath("/account/profile");
}

//Since bookingData is now the first argument,
// we adjust the server action function signature to accept bookingData as the first parameter and formData as the second. This ensures the correct data is received and processed.
//formdata needs to be the last one.
export async function createBooking(bookingData, formData) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in!");

  const { data: existingBookings, error: fetchError } = await supabase
    .from("bookings")
    .select("startDate , endDate")
    .eq("cabinId", bookingData.cabinId);
  if (fetchError) {
    console.error(fetchError);
    throw new Error("Booking could not be fetched");
  }

  //Check for already booked dates
  const newStartDate = new Date(bookingData.startDate);
  const newEndDate = new Date(bookingData.endDate);
  console.log(newStartDate, newEndDate);
  const conflict = existingBookings.some((b) => {
    console.log(b.startDate);
    console.log(b.endDate);
    return rangeOverlaps(
      { from: newStartDate, to: newEndDate },
      { from: new Date(b.startDate), to: new Date(b.endDate) }
    );
  });
  if (conflict) throw new Error("Conflict Dates , select another date");

  const newBooking = {
    ...bookingData,
    guestId: session.user.guestId,
    numGuests: Number(formData.get("numGuests")),
    observations: formData.get("observations").slice(0, 1000),
    extrasPrice: 0,
    totalPrice: bookingData.cabinPrice,
    status: "unconfirmed",
    isPaid: false,
    hasBreakfast: false,
  };
  const { error } = await supabase.from("bookings").insert([newBooking]);

  if (error) {
    console.error(error);
    throw new Error("Booking could not be created");
  }
  //validates the browser cache for dynamic pages
  // validates data cache and full route cache on the server for static pages
  revalidatePath(`/cabin/${bookingData.cabinId}`);
  redirect("/cabins/thankyou");
}

export async function deleteReservation(bookingId) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in!");
  //Make sure that only the guest is allowed to delete his/her
  // reservations .
  //This prevents hackers from deleting any bookings of other users

  const guestBookings = await getBookings(session.user.guestId);

  const guestBookingIds = guestBookings.map((booking) => booking.id);

  if (!guestBookingIds.includes(bookingId)) {
    throw new Error("You are not allowed to delete this booking!");
  }

  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId);

  if (error) {
    console.error(error);
    throw new Error("Booking could not be deleted");
  }

  revalidatePath("/account/reservations");
}

export async function updateReservation(formData) {
  const bookingId = Number(formData.get("bookingId"));

  // 1 - Athentication
  const session = await auth();
  if (!session) throw new Error("You must be logged in!");

  // 2 - Authorization
  //Make sure that only the guest is allowed to delete his/her
  // reservations .
  //This prevents hackers from deleting any bookings of other users

  const guestBookings = await getBookings(session.user.guestId);

  const guestBookingIds = guestBookings.map((booking) => booking.id);

  if (!guestBookingIds.includes(bookingId)) {
    throw new Error("You are not allowed to update this booking!");
  }

  const updateData = {
    numGuests: Number(formData.get("numGuests")),
    observations: formData.get("observations").slice(0, 1000),
  };
  const { error } = await supabase
    .from("bookings")
    .update(updateData)
    .eq("id", bookingId);

  if (error) {
    console.error(error);
    throw new Error("Booking could not be updated");
  }
  revalidatePath(`/account/reservations/edit/${bookingId}`);
  redirect("/account/reservations");
}
// "use server";

// import { auth, signIn, signOut } from "./auth";
// import { getBookings } from "./data-service";
// import { supabase } from "./supabase";
// import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation";

// export async function updateGuest(formData) {
//   const session = await auth();
//   if (!session) throw new Error("You must be logged in");

//   const nationalID = formData.get("nationalID");
//   const [nationality, countryFlag] = formData.get("nationality").split("%");

//   if (!/^[a-zA-Z0-9]{6,12}$/.test(nationalID))
//     throw new Error("Please provide a valid national ID");

//   const updateData = { nationality, countryFlag, nationalID };

//   const { data, error } = await supabase
//     .from("guests")
//     .update(updateData)
//     .eq("id", session.user.guestId);

//   if (error) throw new Error("Guest could not be updated");

//   revalidatePath("/account/profile");
// }

// export async function createBooking(bookingData, formData) {
//   const session = await auth();
//   if (!session) throw new Error("You must be logged in");

//   const newBooking = {
//     ...bookingData,
//     guestId: session.user.guestId,
//     numGuests: Number(formData.get("numGuests")),
//     observations: formData.get("observations").slice(0, 1000),
//     extrasPrice: 0,
//     totalPrice: bookingData.cabinPrice,
//     isPaid: false,
//     hasBreakfast: false,
//     status: "unconfirmed",
//   };

//   const { error } = await supabase.from("bookings").insert([newBooking]);

//   if (error) throw new Error("Booking could not be created");

//   revalidatePath(`/cabins/${bookingData.cabinId}`);

//   redirect("/cabins/thankyou");
// }

// export async function deleteBooking(bookingId) {
//   const session = await auth();
//   if (!session) throw new Error("You must be logged in");

//   const guestBookings = await getBookings(session.user.guestId);
//   const guestBookingIds = guestBookings.map((booking) => booking.id);

//   if (!guestBookingIds.includes(bookingId))
//     throw new Error("You are not allowed to delete this booking");

//   const { error } = await supabase
//     .from("bookings")
//     .delete()
//     .eq("id", bookingId);

//   if (error) throw new Error("Booking could not be deleted");

//   revalidatePath("/account/reservations");
// }

// export async function updateBooking(formData) {
//   const bookingId = Number(formData.get("bookingId"));

//   // 1) Authentication
//   const session = await auth();
//   if (!session) throw new Error("You must be logged in");

//   // 2) Authorization
//   const guestBookings = await getBookings(session.user.guestId);
//   const guestBookingIds = guestBookings.map((booking) => booking.id);

//   if (!guestBookingIds.includes(bookingId))
//     throw new Error("You are not allowed to update this booking");

//   // 3) Building update data
//   const updateData = {
//     numGuests: Number(formData.get("numGuests")),
//     observations: formData.get("observations").slice(0, 1000),
//   };

//   // 4) Mutation
//   const { error } = await supabase
//     .from("bookings")
//     .update(updateData)
//     .eq("id", bookingId)
//     .select()
//     .single();

//   // 5) Error handling
//   if (error) throw new Error("Booking could not be updated");

//   // 6) Revalidation
//   revalidatePath(`/account/reservations/edit/${bookingId}`);
//   revalidatePath("/account/reservations");

//   // 7) Redirecting
//   redirect("/account/reservations");
// }

// export async function signInAction() {
//   await signIn("google", { redirectTo: "/account" });
// }

// export async function signOutAction() {
//   await signOut({ redirectTo: "/" });
// }
