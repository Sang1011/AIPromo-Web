/// <reference types="jest" />
import { render, screen } from '@testing-library/react'

import Stepper from '../../../../components/Organizer/Stepper'

describe('Stepper', () => {
  const stepLabels = ['Thông tin sự kiện', 'Lịch trình', 'Cài đặt', 'Chính sách']

  describe('Render', () => {
    it('should render all 4 steps', () => {
      render(<Stepper currentStep={1} />)
      stepLabels.forEach(label => {
        expect(screen.getByText(label)).toBeInTheDocument()
      })
    })

    it('should highlight step 1 as active', () => {
      render(<Stepper currentStep={1} />)
      const step1Circle = screen.getAllByTestId('step-circle')[0]
      expect(step1Circle).toHaveClass('bg-primary')
    })

    it('should mark previous steps as done', () => {
      render(<Stepper currentStep={3} />)
      const step1Circle = screen.getAllByTestId('step-circle')[0]
      const step2Circle = screen.getAllByTestId('step-circle')[1]
      expect(step1Circle).toHaveClass('bg-emerald-500')
      expect(step2Circle).toHaveClass('bg-emerald-500')
    })

    it('should show checkmark for completed steps', () => {
      render(<Stepper currentStep={2} />)
      const step1Circle = screen.getAllByTestId('step-circle')[0]
      expect(step1Circle.querySelector('svg')).toBeInTheDocument()
    })

    it('should leave future steps inactive', () => {
      render(<Stepper currentStep={1} />)
      const step2Circle = screen.getAllByTestId('step-circle')[1]
      expect(step2Circle).toHaveClass('bg-white\\/10')
    })

    it('should connect completed steps with line', () => {
      render(<Stepper currentStep={2} />)
      const line1 = screen.getAllByTestId('step-line')[0]
      expect(line1).toHaveClass('bg-emerald-500')
    })

    it('should leave future step lines inactive', () => {
      render(<Stepper currentStep={1} />)
      const line1 = screen.getAllByTestId('step-line')[0]
      expect(line1).toHaveClass('bg-white\\/10')
    })
  })

  describe('Step Numbers', () => {
    it('should display step numbers', () => {
      render(<Stepper currentStep={1} />)
      const stepNumbers = screen.getAllByTestId('step-number')
      expect(stepNumbers).toHaveLength(4)
      expect(stepNumbers[0]).toHaveTextContent('1')
      expect(stepNumbers[1]).toHaveTextContent('2')
    })

    it('should hide number for completed steps', () => {
      render(<Stepper currentStep={2} />)
      const step1Circle = screen.getAllByTestId('step-circle')[0]
      expect(step1Circle).not.toHaveTextContent('1')
    })
  })

  describe('Edge Cases', () => {
    it('should handle step 0', () => {
      render(<Stepper currentStep={0} />)
      expect(screen.getAllByTestId('step-circle')[0]).toHaveClass('bg-white\\/10')
    })

    it('should handle step greater than 4', () => {
      render(<Stepper currentStep={5} />)
      const allCircles = screen.getAllByTestId('step-circle')
      allCircles.forEach(circle => {
        expect(circle).toHaveClass('bg-emerald-500')
      })
    })
  })
})
