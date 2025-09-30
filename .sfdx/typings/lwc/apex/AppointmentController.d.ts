declare module "@salesforce/apex/AppointmentController.getUpcomingAppointments" {
  export default function getUpcomingAppointments(param: {patientId: any}): Promise<any>;
}
declare module "@salesforce/apex/AppointmentController.createAppointment" {
  export default function createAppointment(param: {appointment: any}): Promise<any>;
}
declare module "@salesforce/apex/AppointmentController.updateAppointmentStatus" {
  export default function updateAppointmentStatus(param: {appointmentId: any, newStatus: any}): Promise<any>;
}
declare module "@salesforce/apex/AppointmentController.getAllPatients" {
  export default function getAllPatients(): Promise<any>;
}
