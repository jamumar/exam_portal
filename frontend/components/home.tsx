'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'

export function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <nav className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold">
              MockExam Pro
            </Link>
            <div className="space-x-4">
              <Link href="/login">
                <Button variant="secondary">Login</Button>
              </Link>
              <Link href="/register">
                <Button>Register</Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        <section className="bg-gradient-to-b from-primary to-primary-foreground text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Ace Your Exams with MockExam Pro</h1>
            <p className="text-xl mb-8">Prepare for GMAT, GRE, SAT, and IELTS with our adaptive mock exams and personalized study plans.</p>
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">Get Started</Button>
            </Link>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose MockExam Pro?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="mr-2 text-primary" />
                    Adaptive Testing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Our exams adapt to your skill level, providing a personalized and challenging experience.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="mr-2 text-primary" />
                    Comprehensive Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Get detailed insights into your performance and track your progress over time.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="mr-2 text-primary" />
                    Expert-Crafted Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Our questions are designed by test experts to closely mimic real exam conditions.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-8">Ready to Boost Your Test Scores?</h2>
            <p className="text-xl mb-8">Join thousands of students who have improved their scores with MockExam Pro.</p>
            <div className="space-x-4">
              <Link href="/register">
                <Button size="lg">Sign Up Now</Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">Log In</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-background py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">&copy; 2023 MockExam Pro. All rights reserved.</p>
          <div className="mt-4 space-x-4">
            <Link href="/about" className="text-muted-foreground hover:text-primary">About</Link>
            <Link href="/contact" className="text-muted-foreground hover:text-primary">Contact</Link>
            <Link href="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link>
            <Link href="/terms" className="text-muted-foreground hover:text-primary">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}