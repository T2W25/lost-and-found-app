import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
 
// Validation schema
// Added basic input validation
const ItemReportSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Item name is required'),
  description: Yup.string()
    .min(10, 'Please provide more details')
    .max(500, 'Description is too long')
    .required('Category is required'),
  lostDate: Yup.date()
    .max(new Date(), 'Date cannot be in the future')
    .required('Lost date is required'),
  lostLocation: Yup.string().required('Location is required'),
  contactMethod: Yup.string().required('Contact method is required'),
  contactInfo: Yup.string().required('Contact information is required'),
});
 
const ItemReportForm = ({ onSubmit, loading }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
 
// Create simple image upload functionality
  const handleImageChange = (event, setFieldValue) => {
    const file = event.currentTarget.files[0];
    if (file) {
      setImageFile(file);
      setFieldValue('image', file);
 
// Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
 
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
      // Added basic input validation
      validationSchema={ItemReportSchema}
      // Implement form submission
      onSubmit={(values) => {
        onSubmit(values, imageFile);
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
            <ErrorMessage
              name="name"
              component="div"
              className="error-message"
            />
          </div>
 
          {/*Create item category dropdown*/}
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <Field
              as="select"
              name="category"
              id="category"
              className="form-control"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Field>
            <ErrorMessage
              name="category"
              component="div"
              className="error-message"
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
            {/* Add basic input validation */}
            <ErrorMessage
              name="description"
              component="div"
              className="error-message"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="lostLocation">Where was it lost?</label>
            <Field
              type="text"
              name="lostLocation"
              id="lostLocation"
              className="form-control"
              placeholder="Be as specific as possible"
            />
            <ErrorMessage
              name="lostLocation"
              component="div"
              className="error-message"
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
            {/* Add basic input validation */}
            <ErrorMessage
              name="lostDate"
              component="div"
              className="error-message"
            />
          </div>
 
          {/*Create simple image upload functionality*/}
          <div className="form-group">
            <label htmlFor="image">Upload Image (Optional)</label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              className="form-control"
              onChange={(event) => handleImageChange(event, setFieldValue)}
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
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
            {/* Add basic input validation */}
            <ErrorMessage
              name="contactMethod"
              component="div"
              className="error-message"
            />
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
            {/* Add basic input validation */}
            <ErrorMessage
              name="contactInfo"
              component="div"
              className="error-message"
            />
          </div>
 
          {/* Implement form submission */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Report Item'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};
 
export default ItemReportForm;
 