public with sharing class AppointmentController {
    
    @AuraEnabled(cacheable=true)
    public static List<Appointment__c> getUpcomingAppointments(Id patientId) {
        try {
            return [SELECT Id, Name, Appointment_Date__c, Doctor_Name__c, 
                   Specialization__c, Status__c, Symptoms__c
                   FROM Appointment__c
                   WHERE Patient__c = :patientId AND Appointment_Date__c >= TODAY
                   ORDER BY Appointment_Date__c ASC LIMIT 50];
        } catch (Exception e) {
            throw new AuraHandledException('Error: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static String createAppointment(Appointment__c appointment) {
        try {
            insert appointment;
            return 'Success: Appointment created successfully!';
        } catch (Exception e) {
            throw new AuraHandledException('Error: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static String updateAppointmentStatus(Id appointmentId, String newStatus) {
        try {
            Appointment__c apt = [SELECT Id, Status__c FROM Appointment__c 
                                 WHERE Id = :appointmentId];
            apt.Status__c = newStatus;
            update apt;
            return 'Success: Status updated to ' + newStatus;
        } catch (Exception e) {
            throw new AuraHandledException('Error: ' + e.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Patient__c> getAllPatients() {
        try {
            return [SELECT Id, Name, Email__c, Phone__c, Blood_Group__c
                   FROM Patient__c ORDER BY Name ASC LIMIT 100];
        } catch (Exception e) {
            throw new AuraHandledException('Error: ' + e.getMessage());
        }
    }
}
