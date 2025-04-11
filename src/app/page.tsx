import AnonymizerForm from '../components/AnonymizerForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Text Anonymizer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Protect sensitive information by automatically detecting and masking data.
          </p>
        </div>
        <AnonymizerForm />
      </div>
    </main>
  );
}
