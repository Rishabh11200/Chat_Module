import React, {FC} from 'react';
import {Provider as PaperProvider} from 'react-native-paper';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Navigation from './src/Routes';
import SplashScreen from 'react-native-lottie-splash-screen';
// import {LogBox} from 'react-native';

const App: FC = () => {
  // LogBox.ignoreAllLogs();
  React.useEffect(() => {
    SplashScreen.hide();
  }, []);
  return (
    <PaperProvider>
      <SafeAreaProvider>
        <Navigation />
      </SafeAreaProvider>
    </PaperProvider>
  );
};

export default App;
