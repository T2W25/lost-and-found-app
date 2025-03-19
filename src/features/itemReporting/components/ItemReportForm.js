import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
 
const ItemReportForm = ({ onSubmit, loading }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
 
  const categories = [
    'Electronics',
    'Clothing',
    'Accessories',
    'Documents',
    'Keys',
    'Wallet/Purse',
    'Bag/Backpack',
    'Other',
  ];
 
  const contactMethods = ['Email', 'Phone', 'Both'];
 
  return (
    <Formik
      initialValues={{
        name: '',
        description: '',
        category: '',
        lostDate: new Date(),
        lostLocation: '',
        contactMethod: '',
        contactInfo: '',
        image: null,
      }}
    >
      {({ setFieldValue, values, errors, touched }) => (
        <Form className="item-report-form">
          <div className="form-group">
            <label htmlFor="name">Item Name</label>
            <Field
              type="text"
              name="name"
              id="name"
              className="form-control"
              placeholder="e.g., Blue Backpack, iPhone 12, etc."
            />
          </div>
 
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <Field
              as="textarea"
              name="description"
              id="description"
              className="form-control"
              rows="4"
              placeholder="Provide details about the item (color, brand, distinguishing features, etc.)"
            />
          </div>
 
          <div className="form-group">
            <label htmlFor="lostDate">When was it lost?</label>
            <DatePicker
              selected={values.lostDate}
              onChange={(date) => setFieldValue('lostDate', date)}
              className="form-control"
              maxDate={new Date()}
              dateFormat="MMMM d, yyyy"
            />
          </div>
 
          <div className="form-group">
            <label htmlFor="contactMethod">Preferred Contact Method</label>
            <Field
              as="select"
              name="contactMethod"
              id="contactMethod"
              className="form-control"
            >
              <option value="">Select contact method</option>
              {contactMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </Field>
          </div>
 
          <div className="form-group">
            <label htmlFor="contactInfo">Contact Information</label>
            <Field
              type="text"
              name="contactInfo"
              id="contactInfo"
              className="form-control"
              placeholder="Email or phone number"
            />
          </div>
        </Form>
      )}
    </Formik>
  );
};
 
export default ItemReportForm;