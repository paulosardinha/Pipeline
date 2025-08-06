import React from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

const SubscriptionStatus = () => {
  const { subscriptionStatus, user } = useAuth();

  if (!user || !subscriptionStatus) {
    return null;
  }

  const getStatusIcon = () => {
    if (subscriptionStatus.hasActiveSubscription) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else if (subscriptionStatus.message?.includes('expirada')) {
      return <Clock className="w-5 h-5 text-yellow-600" />;
    } else {
      return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusBadge = () => {
    if (subscriptionStatus.hasActiveSubscription) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Ativa</Badge>;
    } else if (subscriptionStatus.message?.includes('expirada')) {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Expirada</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Inativa</Badge>;
    }
  };

  const getStatusMessage = () => {
    if (subscriptionStatus.hasActiveSubscription) {
      return 'Sua assinatura está ativa e você tem acesso completo ao sistema.';
    } else if (subscriptionStatus.message?.includes('expirada')) {
      return 'Sua assinatura expirou. Renove sua assinatura na Hotmart para continuar usando o sistema.';
    } else {
      return 'Sua assinatura não está ativa. Verifique se o pagamento foi processado ou reative sua assinatura na Hotmart.';
    }
  };

  return (
    <Card className="bg-white shadow-sm border-l-4 border-l-green-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <CardTitle className="text-lg">Status da Assinatura</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
        <CardDescription>
          {getStatusMessage()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {subscriptionStatus.subscription && (
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Plano:</span>
              <span className="font-medium">
                {subscriptionStatus.subscription.hotmart_plan_name || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Última atualização:</span>
              <span className="font-medium">
                {new Date(subscriptionStatus.subscription.updated_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
            {subscriptionStatus.subscription.hotmart_transaction_id && (
              <div className="flex justify-between">
                <span>ID da Transação:</span>
                <span className="font-medium text-xs">
                  {subscriptionStatus.subscription.hotmart_transaction_id}
                </span>
              </div>
            )}
          </div>
        )}
        
        {!subscriptionStatus.hasActiveSubscription && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                Para reativar sua assinatura, acesse sua área de membros na Hotmart e renove o pagamento.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatus; 