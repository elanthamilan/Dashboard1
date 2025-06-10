import React from 'react';
import { Modal, Form, Input, Select, DatePicker, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { Applicant, ApplicationStatus } from './types'; // Adjust path
import dayjs from 'dayjs';
import { faker } from '@faker-js/faker'; // For generating some defaults

const { Option } = Select;

interface NewApplicationFormProps {
  visible: boolean;
  onClose: () => void;
  onAddApplicant: (applicant: Applicant) => void;
}

// Subset of programs for the form, can be expanded or fetched
const programs = [
  { id: 'CS101', name: 'BSc Computer Science' },
  { id: 'MBA202', name: 'Master of Business Administration' },
  { id: 'ENG303', name: 'BEng Mechanical Engineering' },
  { id: 'ART404', name: 'MA Fine Arts' },
  { id: 'SCI505', name: 'PhD Quantum Physics' },
];

const NewApplicationForm: React.FC<NewApplicationFormProps> = ({ visible, onClose, onAddApplicant }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const selectedProgram = programs.find(p => p.id === values.programId);

      // Create a new applicant object with mock data for fields not in the form
      const newApplicant: Applicant = {
        id: `APP-${String(faker.number.int({ min: 10000, max: 99999 })).padStart(5, '0')}`, // Simple random ID
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: values.phoneNumber || undefined,
        dateOfBirth: values.dateOfBirth.toISOString(),
        nationality: faker.location.country(), // Mocked
        gender: 'Prefer not to say', // Mocked
        address: { // Mocked
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          postalCode: faker.location.zipCode(),
          country: faker.location.country(),
        },
        applicationDate: dayjs().toISOString(), // Today's date
        programId: values.programId,
        programName: selectedProgram ? selectedProgram.name : 'Unknown Program',
        status: 'Applied' as ApplicationStatus, // Default status
        applicationFee: { paid: false, amount: 50 }, // Mocked
        funnelStage: 1, // Applied
        // Other fields can be undefined or have default mock values if needed
        documents: [],
        originCoordinates: { lat: faker.location.latitude(), lng: faker.location.longitude() }
      };

      onAddApplicant(newApplicant);
      form.resetFields();
      onClose();
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  return (
    <Modal
      title={t('newApplicationForm.title', 'New Application')}
      visible={visible}
      onCancel={() => { form.resetFields(); onClose(); }}
      destroyOnClose
      footer={[
        <Button key="back" onClick={() => { form.resetFields(); onClose(); }}>
          {t('common.actions.cancel', 'Cancel')}
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          {t('common.actions.submit', 'Submit Application')}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" name="newApplicationForm">
        <Form.Item
          name="firstName"
          label={t('newApplicationForm.firstName', 'First Name')}
          rules={[{ required: true, message: t('common.validations.requiredField', 'This field is required') }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="lastName"
          label={t('newApplicationForm.lastName', 'Last Name')}
          rules={[{ required: true, message: t('common.validations.requiredField', 'This field is required') }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="email"
          label={t('newApplicationForm.email', 'Email Address')}
          rules={[
            { required: true, message: t('common.validations.requiredField', 'This field is required') },
            { type: 'email', message: t('common.validations.invalidEmail', 'Please enter a valid email') }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="phoneNumber"
          label={t('newApplicationForm.phoneNumber', 'Phone Number (Optional)')}
        >
          <Input />
        </Form.Item>
        <Form.Item
            name="dateOfBirth"
            label={t('newApplicationForm.dateOfBirth', 'Date of Birth')}
            rules={[{ required: true, message: t('common.validations.requiredField', 'This field is required') }]}
        >
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item
          name="programId"
          label={t('newApplicationForm.program', 'Program')}
          rules={[{ required: true, message: t('common.validations.requiredField', 'This field is required') }]}
        >
          <Select placeholder={t('newApplicationForm.selectProgramPlaceholder', 'Select a program')}>
            {programs.map(program => (
              <Option key={program.id} value={program.id}>{program.name}</Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default NewApplicationForm;
