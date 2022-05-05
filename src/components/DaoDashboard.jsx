import React from 'react';
import { useParams } from 'react-router-dom';

export default function DaoDashboard({version}) {
  const { dao } = useParams();

  return (
    <>
      <header>
          <h1>NEAR Challenge #8 - DAO Dashboard - {version}</h1>
      </header>
      <p>
          Dashboard for {dao}.
      </p>
    </>
  );
}
