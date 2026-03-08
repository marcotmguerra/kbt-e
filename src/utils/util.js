// src/utils/util.js
export const showToast = (message, type = 'info') => {
  // Por enquanto, vamos usar o alert padrão. 
  // Futuramente você pode trocar por uma biblioteca como react-toastify
  alert(message);
};

export const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
};