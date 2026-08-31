import JobPostForm from "@/components/jobs/JobPostForm";

export const metadata = { title: "Buat Lowongan" };

export default function NewJobPage() {
  return (
    <div>
      <div className="mx-auto max-w-4xl px-4 pt-8">
        <h1 className="text-2xl font-extrabold text-espresso">
          Lowongan Baru
        </h1>
        <p className="mt-1 text-sm text-espresso-soft">
          Isi singkat saja — barista bisa langsung melamar.
        </p>
      </div>
      <JobPostForm />
    </div>
  );
}
