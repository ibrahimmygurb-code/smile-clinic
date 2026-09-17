export type BookingStatus = "confirmed" | "cancelled";

export type Booking = {
  id: string;
  name: string;
  phone: string;
  serviceId: string;
  serviceName: string;
  duration: number;
  price: number;
  date: string;
  time: string;
  status: BookingStatus;
  createdAt: string;
};

export type CreateBookingInput = {
  name: string;
  phone: string;
  serviceId: string;
  date: string;
  time: string;
};
