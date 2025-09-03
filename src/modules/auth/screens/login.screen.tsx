import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  ScreenContent,
  ScreenFooter,
  ScreenRoot,
} from "@/components/ui/screen-container";
import { Text } from "@/components/ui/text";
import { core } from "@/core";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, ArrowRight } from "lucide-react-native";
import React, { useState, type FunctionComponent } from "react";
import type { ControllerRenderProps } from "react-hook-form";
import { ScrollView } from "react-native";
import Animated, {
  FadeInDown,
  FadeOut,
  FadeOutUp,
} from "react-native-reanimated";

export type AuthScreenProps = Record<string, never>;

type AuthMode = { type: "email" } | { type: "passcode"; email: string };

interface EmailFormValues {
  email: string;
}

interface PasscodeFormValues {
  passcode: string;
}

const EmailForm: FunctionComponent<{
  onSubmit: (email: string) => void;
  onBack: () => void;
}> = ({ onSubmit, onBack }) => {
  const form = useForm<EmailFormValues>({
    defaultValues: {
      email: __DEV__ ? "chris@delacour.co.nz" : "",
    },
  });

  const handleSubmit = form.handleSubmit(async (values: EmailFormValues) => {
    const email = values.email;

    const { error } = await core.auth.signInWithOtp(email);

    if (error) {
      console.error("Error sending OTP to email:", error);
      form.setError("email", { message: "Error sending OTP to email" });
      return;
    }

    onSubmit(email);
  });

  return (
    <Form {...form}>
      <ScreenFooter sticky>
        <Animated.View
          entering={FadeInDown.duration(600).delay(200)}
          exiting={FadeOutUp.duration(300)}
          className="mb-6"
        >
          <Text className="text-2xl font-bold text-primary mb-2">
            Enter your email address
          </Text>
          <Text className="text-muted-foreground mb-4">
            To continue to your please enter your email address below.
          </Text>
        </Animated.View>
        <Animated.View
          entering={FadeInDown.duration(600).delay(200)}
          exiting={FadeOut.duration(300)}
        >
          <FormField
            control={form.control}
            name="email"
            rules={{
              required: "Email is required",
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "Please enter a valid email",
              },
            }}
            render={({
              field,
            }: { field: ControllerRenderProps<EmailFormValues, "email"> }) => (
              <FormItem>
                <FormLabel>Your work e-mail</FormLabel>
                <FormControl>
                  <Input
                    autoFocus
                    placeholder="name@company.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    submitBehavior={"submit"}
                    returnKeyType="next"
                    onSubmitEditing={handleSubmit}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Animated.View>
        <Animated.View
          entering={FadeInDown.duration(600).delay(200)}
          exiting={FadeOut.duration(300)}
          className="flex-col gap-4"
        >
          <Button
            onPress={handleSubmit}
            end={<ArrowRight size={22} />}
            isLoading={form.formState.isSubmitting}
          >
            Next
          </Button>
          <Button
            onPress={onBack}
            variant="outline"
            start={<ArrowLeft size={22} />}
            disabled={form.formState.isSubmitting}
          >
            Back
          </Button>
        </Animated.View>
      </ScreenFooter>
    </Form>
  );
};

const PasscodeForm: FunctionComponent<{
  email: string;
  onSubmit: (passcode: string) => void;
  onBack: () => void;
}> = ({ email, onSubmit, onBack }) => {
  const form = useForm<PasscodeFormValues>({
    defaultValues: {
      passcode: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (values: PasscodeFormValues) => {
    const { error } = await core.auth.verifyOtp(email, values.passcode);

    if (error) {
      console.error("Error verifying OTP:", error);
      form.setError("passcode", { message: "Error verifying OTP" });
      return;
    }

    onSubmit(values.passcode);
  });

  return (
    <Form {...form}>
      <ScreenFooter sticky>
        <Animated.View
          entering={FadeInDown.duration(600).delay(200)}
          exiting={FadeOutUp.duration(300)}
          className="mb-6"
        >
          <Text className="text-2xl font-bold text-primary mb-2">
            Enter your verification code
          </Text>
          <Text className="text-muted-foreground mb-4">
            Please enter the verification code sent to {email}
          </Text>
        </Animated.View>
        <Animated.View
          entering={FadeInDown.duration(600).delay(200)}
          exiting={FadeOut.duration(300)}
        >
          <FormField
            control={form.control}
            name="passcode"
            rules={{
              required: "Code is required",
              minLength: {
                value: 6,
                message: "Please enter all 6 digits",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputOTP
                    maxLength={6}
                    value={field.value}
                    onChange={field.onChange}
                    onComplete={() => handleSubmit()}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Animated.View>
        <Animated.View
          entering={FadeInDown.duration(600).delay(200)}
          exiting={FadeOut.duration(300)}
          className="flex-col gap-4"
        >
          <Button
            onPress={handleSubmit}
            end={<ArrowRight size={22} />}
            isLoading={form.formState.isSubmitting}
          >
            Verify
          </Button>
          <Button
            onPress={onBack}
            variant="outline"
            start={<ArrowLeft size={22} />}
            disabled={form.formState.isSubmitting}
          >
            Back
          </Button>
        </Animated.View>
      </ScreenFooter>
    </Form>
  );
};

export const LoginScreen: FunctionComponent<AuthScreenProps> = () => {
  const navigation = useNavigation();
  const [authMode, setAuthMode] = useState<AuthMode>({ type: "email" });

  const handleEmailSubmit = async (email: string) => {
    setAuthMode({ type: "passcode", email });
  };

  const handlePasscodeSubmit = async (passcode: string) => { };

  const handleBackFromEmail = async () => {
    navigation.goBack();
  };

  const handleBackFromPasscode = () => {
    setAuthMode({ type: "email" });
  };

  return (
    <ScreenRoot>
      <ScreenContent>
        <ScrollView />
      </ScreenContent>

      {authMode.type === "email" ? (
        <EmailForm onSubmit={handleEmailSubmit} onBack={handleBackFromEmail} />
      ) : (
        <PasscodeForm
          email={authMode.email}
          onSubmit={handlePasscodeSubmit}
          onBack={handleBackFromPasscode}
        />
      )}
    </ScreenRoot>
  );
};