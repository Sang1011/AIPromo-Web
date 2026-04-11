/// <reference types="jest" />
import { render, screen } from '@testing-library/react'
import AdminStatsCard, { type AdminStatsCardProps } from '../../../../../components/Admin/shared/AdminStatsCard'
import { MdDashboard } from 'react-icons/md'

// ============================================================================
// TEST DATA
// ============================================================================

const defaultProps: AdminStatsCardProps = {
    label: 'Test Label',
    value: 1234,
    icon: <MdDashboard />,
}

// ============================================================================
// TESTS
// ============================================================================

describe('AdminStatsCard', () => {
    describe('Render', () => {
        it('should render without crashing', () => {
            render(<AdminStatsCard {...defaultProps} />)

            expect(screen.getByText('Test Label')).toBeInTheDocument()
            expect(screen.getByText('1234')).toBeInTheDocument()
        })

        it('should render with string value', () => {
            render(<AdminStatsCard {...defaultProps} value="1,234" />)

            expect(screen.getByText('1,234')).toBeInTheDocument()
        })

        it('should render icon correctly', () => {
            const { container } = render(<AdminStatsCard {...defaultProps} />)

            const iconContainer = container.querySelector('.rounded-lg')
            expect(iconContainer).toBeInTheDocument()
        })
    })

    describe('Optional Props', () => {
        it('should render change text when provided', () => {
            render(
                <AdminStatsCard
                    {...defaultProps}
                    change="+10%"
                />
            )

            expect(screen.getByText('+10%')).toBeInTheDocument()
        })

        it('should render change as positive by default', () => {
            render(
                <AdminStatsCard
                    {...defaultProps}
                    change="+10%"
                />
            )

            const changeElement = screen.getByText('+10%')
            expect(changeElement).toHaveClass('text-emerald-400')
        })

        it('should render change as negative when changePositive is false', () => {
            render(
                <AdminStatsCard
                    {...defaultProps}
                    change="-5%"
                    changePositive={false}
                />
            )

            const changeElement = screen.getByText('-5%')
            expect(changeElement).toHaveClass('text-red-400')
        })

        it('should render subtext when provided', () => {
            render(
                <AdminStatsCard
                    {...defaultProps}
                    subtext="so với tháng trước"
                />
            )

            expect(screen.getByText('so với tháng trước')).toBeInTheDocument()
        })

        it('should render both change and subtext when both provided', () => {
            render(
                <AdminStatsCard
                    {...defaultProps}
                    change="+15%"
                    subtext="vs last month"
                />
            )

            expect(screen.getByText('+15%')).toBeInTheDocument()
            expect(screen.getByText('vs last month')).toBeInTheDocument()
        })

        it('should not render change/subtext section when neither provided', () => {
            const { container } = render(<AdminStatsCard {...defaultProps} />)

            const parentDiv = container.querySelector('.flex.items-center.gap-2')
            expect(parentDiv).toBeNull()
        })
    })

    describe('Styling Props', () => {
        it('should apply custom iconBg', () => {
            const { container } = render(
                <AdminStatsCard
                    {...defaultProps}
                    iconBg="bg-emerald-500/10"
                />
            )

            const iconContainer = container.querySelector('.bg-emerald-500\\/10')
            expect(iconContainer).toBeInTheDocument()
        })

        it('should apply custom iconColor', () => {
            const { container } = render(
                <AdminStatsCard
                    {...defaultProps}
                    iconColor="text-emerald-400"
                />
            )

            const iconContainer = container.querySelector('.text-emerald-400')
            expect(iconContainer).toBeInTheDocument()
        })

        it('should render gradient bar when showGradientBar is true', () => {
            const { container } = render(
                <AdminStatsCard
                    {...defaultProps}
                    showGradientBar
                />
            )

            const gradientBar = container.querySelector('.bg-gradient-to-r')
            expect(gradientBar).toBeInTheDocument()
        })

        it('should not render gradient bar when showGradientBar is false', () => {
            const { container } = render(
                <AdminStatsCard
                    {...defaultProps}
                    showGradientBar={false}
                />
            )

            const gradientBar = container.querySelector('.bg-gradient-to-r')
            expect(gradientBar).toBeNull()
        })
    })

    describe('Children', () => {
        it('should render children when provided', () => {
            render(
                <AdminStatsCard {...defaultProps}>
                    <div data-testid="custom-child">Custom Content</div>
                </AdminStatsCard>
            )

            expect(screen.getByTestId('custom-child')).toBeInTheDocument()
            expect(screen.getByText('Custom Content')).toBeInTheDocument()
        })

        it('should render complex children correctly', () => {
            render(
                <AdminStatsCard {...defaultProps}>
                    <div className="progress-bar">
                        <div data-testid="progress" style={{ width: '75%' }} />
                    </div>
                </AdminStatsCard>
            )

            expect(screen.getByTestId('progress')).toBeInTheDocument()
        })
    })

    describe('Edge Cases', () => {
        it('should handle empty label', () => {
            const { container } = render(<AdminStatsCard {...defaultProps} label="" />)

            const labelElement = container.querySelector('p.text-\\[\\#a592c8\\]')
            expect(labelElement).toBeInTheDocument()
        })

        it('should handle zero value', () => {
            render(<AdminStatsCard {...defaultProps} value={0} />)

            expect(screen.getByText('0')).toBeInTheDocument()
        })

        it('should handle large numbers', () => {
            render(<AdminStatsCard {...defaultProps} value={999999999} />)

            expect(screen.getByText('999999999')).toBeInTheDocument()
        })

        it('should handle undefined change and subtext', () => {
            const { container } = render(
                <AdminStatsCard
                    {...defaultProps}
                    change={undefined}
                    subtext={undefined}
                />
            )

            const section = container.querySelector('.flex.items-center.gap-2')
            expect(section).toBeNull()
        })
    })

    describe('CSS Classes', () => {
        it('should have glass card styling', () => {
            const { container } = render(<AdminStatsCard {...defaultProps} />)

            const card = container.firstChild
            expect(card).toHaveClass('bg-[rgba(24,18,43,0.8)]')
            expect(card).toHaveClass('backdrop-blur-[12px]')
            expect(card).toHaveClass('rounded-xl')
        })

        it('should have hover effects', () => {
            const { container } = render(<AdminStatsCard {...defaultProps} />)

            const card = container.firstChild
            expect(card).toHaveClass('hover:bg-[#1f1837]')
        })

        it('should have relative positioning and overflow hidden', () => {
            const { container } = render(<AdminStatsCard {...defaultProps} />)

            const card = container.firstChild
            expect(card).toHaveClass('relative')
            expect(card).toHaveClass('overflow-hidden')
        })
    })
})
