import { LightningElement, wire, track } from 'lwc';
import getAllPatients from '@salesforce/apex/AppointmentController.getAllPatients';
import getUpcomingAppointments from '@salesforce/apex/AppointmentController.getUpcomingAppointments';
import createAppointment from '@salesforce/apex/AppointmentController.createAppointment';
import updateAppointmentStatus from '@salesforce/apex/AppointmentController.updateAppointmentStatus';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

export default class AppointmentDashboard extends LightningElement {
    @track patients = [];
    @track appointments = [];
    @track selectedPatientId = '';
    @track showCreateForm = false;
    
    // Form fields
    @track appointmentDate = '';
    @track doctorName = '';
    @track specialization = '';
    @track symptoms = '';
    
    wiredAppointmentsResult;

    specializationOptions = [
        { label: 'General Medicine', value: 'General Medicine' },
        { label: 'Cardiology', value: 'Cardiology' },
        { label: 'Orthopedics', value: 'Orthopedics' },
        { label: 'Pediatrics', value: 'Pediatrics' },
        { label: 'Dermatology', value: 'Dermatology' }
    ];

    statusOptions = [
        { label: 'Scheduled', value: 'Scheduled' },
        { label: 'Completed', value: 'Completed' },
        { label: 'Cancelled', value: 'Cancelled' },
        { label: 'No Show', value: 'No Show' }
    ];

    @wire(getAllPatients)
    wiredPatients({ error, data }) {
        if (data) {
            this.patients = data.map(patient => ({
                label: patient.Name,
                value: patient.Id
            }));
        } else if (error) {
            this.showToast('Error', 'Error loading patients', 'error');
        }
    }

    @wire(getUpcomingAppointments, { patientId: '$selectedPatientId' })
    wiredAppointments(result) {
        this.wiredAppointmentsResult = result;
        if (result.data) {
            this.appointments = result.data;
        } else if (result.error) {
            this.showToast('Error', 'Error loading appointments', 'error');
        }
    }

    handlePatientChange(event) {
        this.selectedPatientId = event.detail.value;
    }

    handleShowCreateForm() {
        if (!this.selectedPatientId) {
            this.showToast('Warning', 'Please select a patient first', 'warning');
            return;
        }
        this.showCreateForm = true;
    }

    handleCancelCreate() {
        this.showCreateForm = false;
        this.clearForm();
    }

    handleDateChange(event) {
        this.appointmentDate = event.target.value;
    }

    handleDoctorChange(event) {
        this.doctorName = event.target.value;
    }

    handleSpecializationChange(event) {
        this.specialization = event.detail.value;
    }

    handleSymptomsChange(event) {
        this.symptoms = event.target.value;
    }

    handleCreateAppointment() {
        if (!this.appointmentDate || !this.doctorName || !this.specialization) {
            this.showToast('Error', 'Please fill all required fields', 'error');
            return;
        }

        const appointment = {
            Patient__c: this.selectedPatientId,
            Appointment_Date__c: this.appointmentDate,
            Doctor_Name__c: this.doctorName,
            Specialization__c: this.specialization,
            Symptoms__c: this.symptoms,
            Status__c: 'Scheduled'
        };

        createAppointment({ appointment })
            .then(result => {
                this.showToast('Success', result, 'success');
                this.showCreateForm = false;
                this.clearForm();
                return refreshApex(this.wiredAppointmentsResult);
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
    }

    handleStatusChange(event) {
        const appointmentId = event.target.dataset.id;
        const newStatus = event.detail.value;

        updateAppointmentStatus({ appointmentId, newStatus })
            .then(result => {
                this.showToast('Success', result, 'success');
                return refreshApex(this.wiredAppointmentsResult);
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
    }

    clearForm() {
        this.appointmentDate = '';
        this.doctorName = '';
        this.specialization = '';
        this.symptoms = '';
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title,
            message,
            variant
        });
        this.dispatchEvent(event);
    }

    get hasAppointments() {
        return this.appointments && this.appointments.length > 0;
    }

    get noPatientSelected() {
        return !this.selectedPatientId;
    }
}