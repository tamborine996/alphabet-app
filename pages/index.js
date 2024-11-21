import { AlphabetSpeechApp } from '../components/AlphabetSpeechApp';

const Home = () => {
  console.log('Home page rendering');
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <AlphabetSpeechApp />
    </div>
  );
};

export default Home;
