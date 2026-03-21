import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { CheckCircle, CreditCard, Building2, Rocket } from 'lucide-react';

export const Pricing: React.FC = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Free',
      price: '$0',
      subtitle: 'Best for trying PayFlow',
      icon: Rocket,
      features: [
        'Up to 3 employees',
        'Manual payroll runs',
        'Onchain invoices',
        'Invoice email notifications',
        'USDC payroll on Injective',
      ],
      cta: 'Get Started',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '$29',
      subtitle: 'For startups and growing teams',
      icon: CreditCard,
      features: [
        'Up to 25 employees',
        'Payroll dashboard',
        'Employee status controls',
        'Payroll history',
        'Invoice email delivery',
        'Priority support',
      ],
      cta: 'Start Pro',
      highlighted: true,
    },
    {
      name: 'Business',
      price: '$99',
      subtitle: 'For larger and global teams',
      icon: Building2,
      features: [
        'Unlimited employees',
        'Advanced payroll operations',
        'Team management at scale',
        'Custom support',
        'Future cross-chain funding support',
        'Analytics and reporting',
      ],
      cta: 'Contact Sales',
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-2xl font-semibold text-slate-900 hover:text-blue-600 transition-colors"
          >
            PayFlow
          </button>

          <Button variant="outline" onClick={() => navigate('/')}>
            Back Home
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Pricing & Business Model
          </h1>
          <p className="text-lg text-slate-600">
            Simple subscription plans for modern onchain payroll teams. All plans settle salaries in USDC on Injective.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon;

            return (
              <Card
                key={plan.name}
                className={`relative ${
                  plan.highlighted
                    ? 'border-blue-500 shadow-lg bg-white'
                    : 'border-slate-200 bg-white'
                }`}
              >
                {plan.highlighted && (
                  <Badge className="absolute top-4 right-4 bg-blue-100 text-blue-700 hover:bg-blue-100">
                    Most Popular
                  </Badge>
                )}

                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>

                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.subtitle}</CardDescription>

                  <div className="pt-4">
                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                    <span className="text-slate-500 ml-2">/ month</span>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <span className="text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className={`w-full ${
                      plan.highlighted
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : ''
                    }`}
                    variant={plan.highlighted ? 'default' : 'outline'}
                    onClick={() => navigate('/')}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center text-sm text-slate-500">
          Future versions will support multi-chain USDC funding while keeping Injective as the settlement layer.
        </div>
      </main>
    </div>
  );
};