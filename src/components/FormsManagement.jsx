import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axios";

const FormStepsManagement = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFormIndex, setActiveFormIndex] = useState(0);
  const [editIndex, setEditIndex] = useState(null); // Track which step is being edited
  const [expandedForm, setExpandedForm] = useState(null);

  useEffect(() => {
    fetchFormSteps();
  }, []);

  const fetchFormSteps = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/api/admin/formsteps");
      if (res.data.length > 0) {
        setForms(res.data);
        setExpandedForm(0); // Expand the first form by default
      }
    } catch (error) {
      console.error("Error fetching form steps", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (formIndex, stepIndex) => {
    setActiveFormIndex(formIndex);
    setEditIndex(stepIndex);
  };

  const handleChange = (formIndex, stepIndex, field, value) => {
    const updatedForms = [...forms];
    updatedForms[formIndex].steps[stepIndex] = { 
      ...updatedForms[formIndex].steps[stepIndex], 
      [field]: field === 'number' ? parseInt(value, 10) : value 
    };
    setForms(updatedForms);
  };

  const handleSave = async (formIndex) => {
    try {
      const updatedFormData = forms[formIndex];
      await axiosInstance.post("/api/admin/edit-formsteps", updatedFormData);
      setEditIndex(null);
      alert("Step updated successfully");
    } catch (error) {
      console.error("Error updating form steps", error);
    }
  };

  const toggleFormExpand = (index) => {
    setExpandedForm(expandedForm === index ? null : index);
  };

  const addNewStep = (formIndex) => {
    const updatedForms = [...forms];
    const newStepNumber = updatedForms[formIndex].steps.length > 0 
      ? Math.max(...updatedForms[formIndex].steps.map(step => step.number)) + 1
      : 1;
    
    updatedForms[formIndex].steps.push({
      number: newStepNumber,
      title: `New Step ${newStepNumber}`
    });
    
    setForms(updatedForms);
    // Set this new step to edit mode
    setActiveFormIndex(formIndex);
    setEditIndex(updatedForms[formIndex].steps.length - 1);
  };

  const deleteStep = async (formIndex, stepIndex) => {
    if (window.confirm("Are you sure you want to delete this step?")) {
      const updatedForms = [...forms];
      updatedForms[formIndex].steps.splice(stepIndex, 1);
      setForms(updatedForms);
      
      try {
        await axiosInstance.post("/api/admin/edit-formsteps", updatedForms[formIndex]);
        alert("Step deleted successfully");
      } catch (error) {
        console.error("Error deleting step", error);
      }
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (forms.length === 0) return (
    <div className="p-5 text-center">
      <p className="text-gray-600">No forms found.</p>
    </div>
  );

  return (
    <div className="p-5 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">Form Steps Management</h1>
      
      {forms.map((form, formIndex) => (
        <div key={formIndex} className="mb-6 border rounded-lg shadow-md overflow-hidden bg-white">
          {/* Form Header */}
          <div 
            className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 cursor-pointer"
            onClick={() => toggleFormExpand(formIndex)}
          >
            <div className="flex items-center gap-3">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">Form {formIndex + 1}</span>
              <h2 className="text-xl font-semibold">{form.id}</h2>
            </div>
            <div className="flex items-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className={`transition-transform ${expandedForm === formIndex ? 'rotate-180' : ''}`}
              >
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </div>
          </div>

          {/* Form Content - Steps */}
          {expandedForm === formIndex && (
            <div className="p-4">
              {form.steps.length > 0 ? (
                <div className="space-y-3">
                  {form.steps.map((step, stepIndex) => (
                    <div 
                      key={stepIndex} 
                      className={`border rounded p-4 transition-all ${
                        editIndex === stepIndex && activeFormIndex === formIndex 
                          ? 'bg-blue-50 shadow-md' 
                          : 'bg-white hover:shadow-sm'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row gap-3 items-center">
                        {/* Step Number */}
                        <div className="w-20">
                          {editIndex === stepIndex && activeFormIndex === formIndex ? (
                            <input
                              type="number"
                              value={step.number}
                              onChange={(e) => handleChange(formIndex, stepIndex, "number", e.target.value)}
                              className="border p-2 w-full text-center rounded bg-white"
                            />
                          ) : (
                            <div className="bg-gray-100 p-2 rounded-lg text-center font-medium">
                              Step {step.number}
                            </div>
                          )}
                        </div>
                        
                        {/* Step Title */}
                        <div className="flex-1">
                          {editIndex === stepIndex && activeFormIndex === formIndex ? (
                            <input
                              type="text"
                              value={step.title}
                              onChange={(e) => handleChange(formIndex, stepIndex, "title", e.target.value)}
                              className="border p-2 w-full rounded bg-white"
                              placeholder="Enter step title"
                            />
                          ) : (
                            <p className="p-2">{step.title}</p>
                          )}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {editIndex === stepIndex && activeFormIndex === formIndex ? (
                            <button
                              onClick={() => handleSave(formIndex)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                            >
                              Save
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditClick(formIndex, stepIndex)}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteStep(formIndex, stepIndex)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md font-medium transition-colors"
                              >
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  width="16" 
                                  height="16" 
                                  viewBox="0 0 24 24" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                >
                                  <path d="M3 6h18"></path>
                                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic text-center py-6">No steps defined for this form.</p>
              )}
              
              {/* Add New Step Button */}
              <div className="mt-5 flex justify-center">
                <button
                  onClick={() => addNewStep(formIndex)}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-md transition-colors shadow-sm"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M12 5v14M5 12h14"></path>
                  </svg>
                  Add New Step
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FormStepsManagement;