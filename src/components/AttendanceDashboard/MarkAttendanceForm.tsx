import React, { useEffect } from 'react';
import { Modal, Form, Select, DatePicker, Radio, Input, Button, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import { Student, SchoolClass, AttendanceRecord, AttendanceStatus } from './types'; // Adjust path
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

interface MarkAttendanceFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (record: AttendanceRecord) => void;
  students: Student[];
  schoolClasses: SchoolClass[];
  initialRecord?: AttendanceRecord | null; // For editing existing record
}

const attendanceStatuses: AttendanceStatus[] = ['Present', 'Absent', 'Late', 'Excused'];

const MarkAttendanceForm: React.FC<MarkAttendanceFormProps> = ({
  visible,
  onClose,
  onSave,
  students,
  schoolClasses,
  initialRecord,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const isEditing = !!initialRecord;

  useEffect(() => {
    if (initialRecord) {
      form.setFieldsValue({
        ...initialRecord,
        date: dayjs(initialRecord.date), // Convert date string to dayjs object for DatePicker
      });
    } else {
      form.resetFields();
      // Set default date to today if not editing
      form.setFieldsValue({ date: dayjs() });
    }
  }, [initialRecord, form, visible]); // Rerun when visible changes to reset form or set initial values

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const recordToSave: AttendanceRecord = {
        id: isEditing ? initialRecord!.id : `ATTREC-${String(Date.now()).slice(-6)}`, // Simple new ID generation
        studentId: values.studentId,
        classId: values.classId,
        date: (values.date as dayjs.Dayjs).toISOString(), // Ensure date is ISO string
        status: values.status,
        absenceReason: values.absenceReason || undefined,
        notes: values.notes || undefined,
        recordedAt: dayjs().toISOString(), // Timestamp of this action
        recordedBy: 'CurrentUser_Mock', // Mock current user
      };
      onSave(recordToSave);
      onClose(); // Close modal after save
    } catch (errorInfo) {
      console.log('Failed to save attendance:', errorInfo);
    }
  };

  const handleModalClose = () => {
    // form.resetFields(); // Reset fields when modal is closed via Cancel or X
    onClose();
  }

  return (
    <Modal
      title={isEditing ? t('markAttendanceForm.titleEdit', 'Edit Attendance Record') : t('markAttendanceForm.titleNew', 'Mark Attendance')}
      visible={visible}
      onCancel={handleModalClose}
      destroyOnClose // Ensures form is reset when not visible if not handled explicitly by useEffect
      footer={[
        <Button key="back" onClick={handleModalClose}>
          {t('common.actions.cancel', 'Cancel')}
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          {isEditing ? t('common.actions.saveChanges', 'Save Changes') : t('common.actions.submit', 'Submit')}
        </Button>,
      ]}
      width={600}
    >
      <Form form={form} layout="vertical" name="markAttendanceForm">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="studentId"
              label={t('markAttendanceForm.student', 'Student')}
              rules={[{ required: true, message: t('common.validations.requiredField') }]}
            >
              <Select
                showSearch
                placeholder={t('markAttendanceForm.selectStudentPlaceholder', 'Select Student')}
                optionFilterProp="children"
                filterOption={(input, option) => (option?.children as unknown as string ?? '').toLowerCase().includes(input.toLowerCase())}
                disabled={isEditing} // Usually student/class/date are not editable for an existing record
              >
                {students.map(s => <Option key={s.id} value={s.id}>{`${s.firstName} ${s.lastName}`}</Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="classId"
              label={t('markAttendanceForm.class', 'Class/Course')}
              rules={[{ required: true, message: t('common.validations.requiredField') }]}
            >
              <Select
                showSearch
                placeholder={t('markAttendanceForm.selectClassPlaceholder', 'Select Class')}
                optionFilterProp="children"
                filterOption={(input, option) => (option?.children as unknown as string ?? '').toLowerCase().includes(input.toLowerCase())}
                 disabled={isEditing}
              >
                {schoolClasses.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name="date"
          label={t('markAttendanceForm.date', 'Date')}
          rules={[{ required: true, message: t('common.validations.requiredField') }]}
        >
          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" disabled={isEditing} />
        </Form.Item>
        <Form.Item
          name="status"
          label={t('markAttendanceForm.status', 'Status')}
          rules={[{ required: true, message: t('common.validations.requiredField') }]}
        >
          <Radio.Group>
            {attendanceStatuses.map(status => (
              <Radio key={status} value={status}>{t(`attendanceStatus.${status}`, status)}</Radio>
            ))}
          </Radio.Group>
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => prevValues.status !== currentValues.status}
        >
          {({ getFieldValue }) =>
            (getFieldValue('status') === 'Absent' || getFieldValue('status') === 'Excused' || getFieldValue('status') === 'Late') ? (
              <Form.Item
                name="absenceReason"
                label={t('markAttendanceForm.reason', 'Reason (if Absent/Excused/Late)')}
                rules={[{ required: getFieldValue('status') === 'Absent' || getFieldValue('status') === 'Excused', message: t('common.validations.requiredForStatus') }]}
              >
                <Input placeholder={t('markAttendanceForm.reasonPlaceholder', 'e.g., Illness, Appointment')} />
              </Form.Item>
            ) : null
          }
        </Form.Item>
        <Form.Item
          name="notes"
          label={t('markAttendanceForm.notes', 'Notes (Optional)')}
        >
          <TextArea rows={3} placeholder={t('markAttendanceForm.notesPlaceholder', 'Any additional details')} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default React.memo(MarkAttendanceForm);
