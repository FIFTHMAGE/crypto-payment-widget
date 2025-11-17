import { useState } from 'react'
import { Card, Button } from '../../../components/ui'

type WizardStep = 'details' | 'review' | 'confirm'

interface PaymentWizardProps {
  onComplete?: (data: any) => void
}

export function PaymentWizard({ onComplete }: PaymentWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('details')
  const [paymentData, setPaymentData] = useState({})

  const steps: { id: WizardStep; title: string }[] = [
    { id: 'details', title: 'Payment Details' },
    { id: 'review', title: 'Review' },
    { id: 'confirm', title: 'Confirm' },
  ]

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep)

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id)
    } else {
      onComplete?.(paymentData)
    }
  }

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id)
    }
  }

  return (
    <Card>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  index <= currentStepIndex
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
              <div className="ml-2 flex-1">
                <p className="text-sm font-medium">{step.title}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="h-1 bg-gray-200 flex-1 mx-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="min-h-[300px]">
        {currentStep === 'details' && <div>Step 1: Enter payment details</div>}
        {currentStep === 'review' && <div>Step 2: Review your payment</div>}
        {currentStep === 'confirm' && <div>Step 3: Confirm and submit</div>}
      </div>

      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStepIndex === 0}
        >
          Back
        </Button>
        <Button onClick={handleNext}>
          {currentStepIndex === steps.length - 1 ? 'Submit' : 'Next'}
        </Button>
      </div>
    </Card>
  )
}

