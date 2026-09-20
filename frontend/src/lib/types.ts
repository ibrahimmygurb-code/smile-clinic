export type BookingStatus = "confirmed" | "cancelled" | "deleted";

export type Booking = {
  id: string;
  name: string;
  phone: string;
  doctorId: string;
  doctorName: string;
  serviceId: string;
  serviceName: string;
  duration: number;
  price: number;
  date: string;
  time: string;
  status: BookingStatus;
  createdAt: string;
};
