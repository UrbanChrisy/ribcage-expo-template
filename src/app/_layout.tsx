import { core } from '@/core';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

export default function StackLayout() {


  useEffect(() => {
    core.init();
  }, []);

  return (
    <Stack />
  )
}