import Link from "next/link";
export default function TestingGuide() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Testing guide</h1>
      <ol className="list-decimal space-y-4 pl-5">
        <li>Create a suite to organize related test cases.</li>
        <li>
          Add each test case with the actions to perform and the expected
          result.
        </li>
        <li>Create a test plan or select cases when creating a run.</li>
        <li>Start the run, record each result, and add supporting evidence.</li>
        <li>
          Review failed cases and create linked work items where follow-up is
          needed.
        </li>
        <li>Complete the run to retain its results for your team.</li>
      </ol>
      <p>
        Choose the correct project before creating records. Available actions
        depend on your workspace role and project access.
      </p>
      <Link className="inline-block underline" href="/portal/testing">
        Open testing workspace
      </Link>
    </div>
  );
}
