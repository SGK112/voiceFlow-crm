import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, AlertCircle, Loader2 } from 'lucide-react';
import agentLibraryApi from '../services/agentLibraryApi';

const AgentSetup = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();

  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [configuration, setConfiguration] = useState({});
  const [customName, setCustomName] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Fetch template details
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setLoading(true);
        const response = await agentLibraryApi.getTemplate(templateId);
        setTemplate(response.data);
      } catch (err) {
        setError('Failed to load agent template');
        console.error('Error fetching template:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [templateId]);

  // Handle field changes
  const handleFieldChange = (questionId, value) => {
    setConfiguration(prev => ({
      ...prev,
      [questionId]: value
    }));

    // Clear validation error for this field
    if (validationErrors[questionId]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[questionId];
        return updated;
      });
    }
  };

  // Validate current step
  const validateStep = () => {
    if (!template) return false;

    const currentQuestion = template.setupQuestions[currentStep];
    const errors = {};

    if (currentQuestion.required && !configuration[currentQuestion.id]) {
      errors[currentQuestion.id] = `${currentQuestion.label} is required`;
    }

    // Additional validation based on field type
    if (currentQuestion.type === 'number' && configuration[currentQuestion.id]) {
      const value = parseFloat(configuration[currentQuestion.id]);
      if (currentQuestion.min !== undefined && value < currentQuestion.min) {
        errors[currentQuestion.id] = `Minimum value is ${currentQuestion.min}`;
      }
      if (currentQuestion.max !== undefined && value > currentQuestion.max) {
        errors[currentQuestion.id] = `Maximum value is ${currentQuestion.max}`;
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Navigate to next step
  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  // Navigate to previous step
  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
    setValidationErrors({});
  };

  // Create the agent
  const handleCreateAgent = async () => {
    // Validate all required fields
    const allErrors = {};
    template.setupQuestions.forEach(question => {
      if (question.required && !configuration[question.id]) {
        allErrors[question.id] = `${question.label} is required`;
      }
    });

    if (Object.keys(allErrors).length > 0) {
      setValidationErrors(allErrors);
      setError('Please fill in all required fields');
      return;
    }

    try {
      setCreating(true);
      setError(null);

      const response = await agentLibraryApi.createAgent(
        templateId,
        configuration,
        customName || null
      );

      // Navigate to the agent details page
      navigate(`/app/my-agents/${response.data.agent._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create agent');
      console.error('Error creating agent:', err);
    } finally {
      setCreating(false);
    }
  };

  // Render field based on question type
  const renderField = (question) => {
    const value = configuration[question.id] || '';
    const hasError = validationErrors[question.id];

    switch (question.type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <input
            type={question.type === 'email' ? 'email' : question.type === 'phone' ? 'tel' : 'text'}
            id={question.id}
            value={value}
            onChange={(e) => handleFieldChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            className={`w-full px-4 py-3 rounded-lg border ${
              hasError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            id={question.id}
            value={value}
            onChange={(e) => handleFieldChange(question.id, e.target.value)}
            min={question.min}
            max={question.max}
            placeholder={question.placeholder}
            className={`w-full px-4 py-3 rounded-lg border ${
              hasError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
        );

      case 'textarea':
        return (
          <textarea
            id={question.id}
            value={value}
            onChange={(e) => handleFieldChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            rows={4}
            className={`w-full px-4 py-3 rounded-lg border ${
              hasError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none`}
          />
        );

      case 'select':
        return (
          <select
            id={question.id}
            value={value}
            onChange={(e) => handleFieldChange(question.id, e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border ${
              hasError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          >
            <option value="">Select an option...</option>
            {question.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {question.options.map(option => (
              <label key={option.value} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(option.value)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    const newValues = e.target.checked
                      ? [...currentValues, option.value]
                      : currentValues.filter(v => v !== option.value);
                    handleFieldChange(question.id, newValues);
                  }}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700 dark:text-gray-300">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {question.options.map(option => (
              <label key={option.value} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => handleFieldChange(question.id, e.target.value)}
                  className="w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700 dark:text-gray-300">{option.label}</span>
              </label>
            ))}
          </div>
        );

      default:
        return (
          <input
            type="text"
            id={question.id}
            value={value}
            onChange={(e) => handleFieldChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            className={`w-full px-4 py-3 rounded-lg border ${
              hasError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error && !template) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-900 font-semibold mb-1">Error Loading Template</h3>
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => navigate('/app/agent-library')}
              className="mt-4 text-red-600 hover:text-red-700 font-medium"
            >
              Back to Agent Library
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!template) return null;

  const currentQuestion = template.setupQuestions[currentStep];
  const isLastStep = currentStep === template.setupQuestions.length;
  const progress = ((currentStep) / (template.setupQuestions.length + 1)) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-700">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <button
            onClick={() => navigate('/app/agent-library')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Agent Library
          </button>

          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center text-2xl`}>
              {template.icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Set Up {template.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{template.description}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStep + 1} of {template.setupQuestions.length + 1}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!isLastStep ? (
          // Question Step
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="mb-6">
              <label htmlFor={currentQuestion.id} className="block text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {currentQuestion.label}
                {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {currentQuestion.description && (
                <p className="text-gray-600 text-sm mb-4">{currentQuestion.description}</p>
              )}
            </div>

            {renderField(currentQuestion)}

            {validationErrors[currentQuestion.id] && (
              <p className="mt-2 text-red-600 text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {validationErrors[currentQuestion.id]}
              </p>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                  currentStep === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </button>

              <button
                onClick={handleNext}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        ) : (
          // Review & Create Step
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Review Your Configuration</h2>

            {/* Custom Name (Optional) */}
            <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Custom Agent Name (Optional)
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={`My ${template.name}`}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Leave blank to use the default name: {template.name}
              </p>
            </div>

            {/* Configuration Summary */}
            <div className="space-y-4 mb-8">
              {template.setupQuestions.map(question => {
                const value = configuration[question.id];
                if (!value) return null;

                let displayValue = value;
                if (Array.isArray(value)) {
                  const labels = value.map(v => {
                    const option = question.options?.find(o => o.value === v);
                    return option?.label || v;
                  });
                  displayValue = labels.join(', ');
                } else if (question.options) {
                  const option = question.options.find(o => o.value === value);
                  displayValue = option?.label || value;
                }

                return (
                  <div key={question.id} className="flex justify-between items-start">
                    <span className="text-gray-600 font-medium">{question.label}:</span>
                    <span className="text-gray-900 text-right ml-4">{displayValue}</span>
                  </div>
                );
              })}
            </div>

            {/* Required Integrations */}
            {template.requiredIntegrations.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <h3 className="text-blue-900 font-semibold mb-3">Required Integrations</h3>
                <p className="text-blue-700 text-sm mb-4">
                  After creating your agent, you'll need to connect these integrations before activation:
                </p>
                <ul className="space-y-2">
                  {template.requiredIntegrations.map(integration => (
                    <li key={integration.service} className="flex items-start text-blue-900">
                      <Check className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium capitalize">{integration.service.replace('-', ' ')}</span>
                        <span className="text-blue-700"> - {integration.purpose}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Pricing Summary */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Pricing</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Base Price:</span>
                  <span className="text-gray-900 font-medium">${template.pricing.basePrice}/month</span>
                </div>
                {template.pricing.perCallPrice > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Per Call:</span>
                    <span className="text-gray-900 font-medium">
                      ${template.pricing.perCallPrice} (after {template.pricing.freeCallsIncluded} free)
                    </span>
                  </div>
                )}
                {template.pricing.percentOfCollections > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Collection Fee:</span>
                    <span className="text-gray-900 font-medium">
                      {template.pricing.percentOfCollections * 100}% of collected payments
                    </span>
                  </div>
                )}
                {template.pricing.perReviewBonus > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Per Review:</span>
                    <span className="text-gray-900 font-medium">${template.pricing.perReviewBonus}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handlePrevious}
                className="flex items-center px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </button>

              <button
                onClick={handleCreateAgent}
                disabled={creating}
                className="flex items-center px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Agent...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Create Agent
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentSetup;
