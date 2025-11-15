import React from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { Container } from './Container'

interface PageLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  headerContent?: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  subtitle,
  headerContent,
  maxWidth = 'xl',
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header title={title} subtitle={subtitle}>
        {headerContent}
      </Header>
      <main className="flex-1 py-8">
        <Container maxWidth={maxWidth}>{children}</Container>
      </main>
      <Footer />
    </div>
  )
}

