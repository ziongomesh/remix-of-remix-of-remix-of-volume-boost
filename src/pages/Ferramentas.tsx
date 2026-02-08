import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageMinus, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const tools = [
  {
    title: 'Removedor de Fundo',
    description: 'Remova o fundo de fotos 3x4 automaticamente com IA',
    icon: ImageMinus,
    href: '/ferramentas/remover-fundo',
    color: 'text-blue-500',
  },
  {
    title: 'Editor de PDF',
    description: 'Edite campos de texto, mova ou exclua elementos de qualquer PDF',
    icon: FileText,
    href: '/ferramentas/editor-pdf',
    color: 'text-orange-500',
  },
];

export default function Ferramentas() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">🛠️ Ferramentas</h1>
          <p className="text-muted-foreground">Ferramentas úteis para o dia a dia</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link key={tool.href} to={tool.href}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className={`p-2 rounded-lg bg-primary/10 ${tool.color}`}>
                    <tool.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{tool.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{tool.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
