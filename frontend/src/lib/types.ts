export type BookingStatus = "confirmed" | "cancelled" | "deleted";

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  offDates: string[];
};

export function isDoctorOnLeave(doctor: Doctor, date: string) {
  return Boolean(date && doctor.offDates.includes(date));
}

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
