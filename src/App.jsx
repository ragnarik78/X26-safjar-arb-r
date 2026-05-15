import React, { useMemo, useState } from "react";

const SEATS = 9;

const initialParties = [
  {
    id: 1,
    name: "B-listi Framsóknarflokksins og óháðra",
    votes: 0,
    candidates: [
      "Kristján Þór Kristjánsson",
      "Elísabet Samúelsdóttir",
      "Stefán Hannibal Hafberg",
      "Tinna Rún Snorradóttir",
      "Elísabet Margrét Jónasdóttir",
      "Guðni Páll Viktorsson",
      "Gerður Ágústa Sigmundsdóttir",
      "Gauti Geirsson",
      "Katarzyna Maliszewska",
    ],
  },
  {
    id: 2,
    name: "C-listi Viðreisnar",
    votes: 0,
    candidates: [
      "Gylfi Ólafsson",
      "Sif Huld Albertsdóttir",
      "Magnús Einar Magnússon",
      "Arnheiður Steinþórsdóttir",
      "Valur Richter",
      "Halldóra Norðdahl",
      "Sigþór Snorrason",
      "Hanna Gerður Jónsdóttir",
      "Marcel Knop",
    ],
  },
  {
    id: 3,
    name: "D-listi Sjálfstæðisflokksins",
    votes: 0,
    candidates: [
      "Jónas Þór Birgisson",
      "Þóra Marý Arnórsdóttir",
      "Martha Kristín Pálmadóttir",
      "Grétar Örn Eiríksson",
      "Þorvaldur Óli Ragnarsson",
      "Ásgerður Þorleifsdóttir",
      "Snorri Karl Birgisson",
      "Jón Gunnar Shiransson",
      "Baldur Smári Ólafsson",
    ],
  },
  {
    id: 4,
    name: "M-listi Miðflokksins",
    votes: 0,
    candidates: [
      "Sævar Óli Hjörvarsson",
      "Jón Auðun Auðunarson",
      "Þorbjörn Halldór Jóhannesson",
      "Karlotta Dúfa Markan",
      "Hákon Sturla Unnsteinsson",
      "Sigríður Laufey Sigurðardóttir",
      "Albert Guðmundur Haraldsson",
      "Júlíana Aðalheiður Ernisdóttir",
      "Hákon Hermannsson",
    ],
  },
  {
    id: 5,
    name: "S-listi Samfylkingarinnar",
    votes: 0,
    candidates: [
      "Svanfríður Guðrún Bergvinsdóttir",
      "Helgi Karl Guðmundsson",
      "Finney Rakel Árnadóttir",
      "Sigurður Jón Hreinsson",
      "Hrafnhildur Hrönn Óðinsdóttir",
      "Gísli Már Guðjónsson",
      "Jónína Eyja Þórðardóttir",
      "Úlfar Logason",
      "Iwona Maria Samson",
    ],
  },
];

function formatNumber(value, maxFractions = 2) {
  return new Intl.NumberFormat("is-IS", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxFractions,
  }).format(Number(value) || 0);
}

function Input({ value, onChange, type = "text", min, max, step, placeholder }) {
  return (
    <input
      className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
      type={type}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
}

function Card({ children, className = "" }) {
  return <section className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</section>;
}

function CardHeader({ children, className = "" }) {
  return <div className={`border-b border-slate-100 p-5 ${className}`}>{children}</div>;
}

function CardContent({ children, className = "" }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}

function CardTitle({ children, className = "" }) {
  return <h2 className={`text-xl font-semibold text-slate-900 ${className}`}>{children}</h2>;
}

function Button({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
    >
      {children}
    </button>
  );
}

function calculateDhondt(parties, seats) {
  const validParties = parties
    .map((party) => ({ ...party, votes: Number(party.votes) || 0 }))
    .filter((party) => party.votes > 0);

  const seatCount = Object.fromEntries(parties.map((party) => [party.id, 0]));
  const rounds = [];
  let hadTie = false;

  for (let round = 1; round <= seats; round += 1) {
    if (validParties.length === 0) break;

    const quotients = validParties.map((party) => {
      const divisor = seatCount[party.id] + 1;
      return {
        partyId: party.id,
        partyName: party.name,
        baseVotes: party.votes,
        divisor,
        quotient: party.votes / divisor,
      };
    });

    quotients.sort((a, b) => {
      if (b.quotient !== a.quotient) return b.quotient - a.quotient;
      if (b.baseVotes !== a.baseVotes) return b.baseVotes - a.baseVotes;
      return a.partyName.localeCompare(b.partyName, "is");
    });

    const winner = quotients[0];
    const tiedWinners = quotients.filter((item) => item.quotient === winner.quotient);

    if (tiedWinners.length > 1) hadTie = true;

    seatCount[winner.partyId] += 1;

    rounds.push({
      round,
      winnerPartyId: winner.partyId,
      winnerPartyName: winner.partyName,
      quotient: winner.quotient,
      divisor: winner.divisor,
    });
  }

  const results = parties
    .map((party) => ({
      ...party,
      votes: Number(party.votes) || 0,
      seats: seatCount[party.id] || 0,
    }))
    .sort((a, b) => {
      if (b.seats !== a.seats) return b.seats - a.seats;
      if (b.votes !== a.votes) return b.votes - a.votes;
      return a.name.localeCompare(b.name, "is");
    });

  const lastAllocatedSeat = rounds.length > 0 ? rounds[rounds.length - 1] : null;
  const nextSeatCandidates = parties
    .map((party) => {
      const votes = Number(party.votes) || 0;
      const partySeats = seatCount[party.id] || 0;
      const nextDivisor = partySeats + 1;
      const nextQuotient = votes / nextDivisor;
      const votesNeeded = lastAllocatedSeat
        ? Math.max(0, Math.floor(lastAllocatedSeat.quotient * nextDivisor - votes) + 1)
        : 0;

      return {
        ...party,
        votes,
        seats: partySeats,
        nextDivisor,
        nextQuotient,
        votesNeeded,
        nextCandidate: party.candidates[partySeats] || null,
      };
    })
    .filter((party) => party.votes > 0 && party.nextCandidate)
    .sort((a, b) => {
      if (b.nextQuotient !== a.nextQuotient) return b.nextQuotient - a.nextQuotient;
      if (b.votes !== a.votes) return b.votes - a.votes;
      return a.name.localeCompare(b.name, "is");
    });

  return {
    results,
    rounds,
    hadTie,
    nextIn: nextSeatCandidates[0] || null,
    lastAllocatedSeat,
  };
}

export default function App() {
  const [parties, setParties] = useState(initialParties);
  const [registeredVoters, setRegisteredVoters] = useState(2976);
  const [blankVotes, setBlankVotes] = useState(42);
  const [invalidVotes, setInvalidVotes] = useState(0);

  const validVotes = useMemo(
    () => parties.reduce((sum, party) => sum + (Number(party.votes) || 0), 0),
    [parties]
  );

  const otherVotes = (Number(blankVotes) || 0) + (Number(invalidVotes) || 0);
  const totalCastVotesFromInputs = validVotes + otherVotes;
  const turnoutPercent = (Number(registeredVoters) || 0) > 0
    ? (totalCastVotesFromInputs / (Number(registeredVoters) || 0)) * 100
    : 0;

  const { results, rounds, hadTie, nextIn, lastAllocatedSeat } = useMemo(
    () => calculateDhondt(parties, SEATS),
    [parties]
  );

  const updatePartyVotes = (id, value) => {
    setParties((current) =>
      current.map((party) => (party.id === id ? { ...party, votes: value } : party))
    );
  };

  const electedCandidates = useMemo(() => {
    return results
      .flatMap((party) =>
        party.candidates.slice(0, party.seats).map((candidate, index) => ({
          candidate,
          listName: party.name,
          listVotes: party.votes,
          listPercent: validVotes > 0 ? (party.votes / validVotes) * 100 : 0,
          listPosition: index + 1,
        }))
      )
      .sort((a, b) => {
        if (b.listVotes !== a.listVotes) return b.listVotes - a.listVotes;
        if (a.listPosition !== b.listPosition) return a.listPosition - b.listPosition;
        return a.candidate.localeCompare(b.candidate, "is");
      });
  }, [results, validVotes]);

  const resetValues = () => {
    setParties(initialParties);
    setRegisteredVoters(2976);
    setBlankVotes(42);
    setInvalidVotes(0);
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Sætaskipting í Ísafjarðarbæ</h1>
          <p className="max-w-4xl text-sm text-slate-600 md:text-base">
            Reiknivél fyrir framboðslista í Ísafjarðarbæ í sveitarstjórnarkosningunum 2026. Sláðu inn fjölda atkvæða hjá hverjum lista, fjölda á kjörskrá og fjölda auðra og ógildra atkvæða. Kjörsókn og fylgi reiknast sjálfkrafa. Fylgi reiknast út frá gildum atkvæðum til lista, og síðan er {SEATS} sætum skipt með deilingaraðferð 1, 2, 3, 4 o.s.frv. (d’Hondt).
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Kjörgögn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Fjöldi á kjörskrá</label>
                    <Input type="number" min="0" value={registeredVoters} onChange={(e) => setRegisteredVoters(e.target.value)} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Kjörsókn (%)</label>
                    <div className="flex h-10 items-center rounded-md border border-slate-300 bg-slate-50 px-3 text-sm font-medium text-slate-700">
                      {formatNumber(turnoutPercent)}%
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Auð atkvæði</label>
                    <Input type="number" min="0" value={blankVotes} onChange={(e) => setBlankVotes(e.target.value)} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Ógild atkvæði</label>
                    <Input type="number" min="0" value={invalidVotes} onChange={(e) => setInvalidVotes(e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle>Listar og atkvæði</CardTitle>
                <Button onClick={resetValues}>Núllstilla tölur</Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  {parties.map((party) => {
                    const votes = Number(party.votes) || 0;
                    const percent = validVotes > 0 ? (votes / validVotes) * 100 : 0;

                    return (
                      <div key={party.id} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 md:grid-cols-[1.4fr_0.8fr_0.55fr]">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-slate-700">Framboðslisti</label>
                          <div className="flex min-h-10 items-center rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                            {party.name}
                          </div>
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-slate-700">Atkvæði</label>
                          <Input type="number" min="0" value={party.votes} onChange={(e) => updatePartyVotes(party.id, e.target.value)} placeholder="t.d. 512" />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-slate-700">Fylgi</label>
                          <div className="flex h-10 items-center rounded-md border border-slate-300 bg-slate-50 px-3 text-sm font-medium text-slate-700">
                            {formatNumber(percent)}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <SummaryBox label="Gild atkvæði til lista" value={formatNumber(validVotes, 0)} />
                  <SummaryBox label="Auð + ógild" value={formatNumber(otherVotes, 0)} />
                  <SummaryBox label="Atkvæði samkvæmt inntaki" value={formatNumber(totalCastVotesFromInputs, 0)} />
                  <SummaryBox label="Kjörsókn" value={`${formatNumber(turnoutPercent)}%`} />
                </div>

                {hadTie && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                    Jafntefli kom upp í að minnsta kosti einni úthlutun. Hér er því raðað sjálfgefið til að sýna niðurstöðu, en í raunverulegri kosningu þarf að skera úr með hlutkesti.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Niðurstaða</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.map((party) => {
                  const percent = validVotes > 0 ? (party.votes / validVotes) * 100 : 0;

                  return (
                    <div key={party.id} className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-semibold text-slate-900">{party.name}</div>
                          <div className="text-sm text-slate-600">
                            {formatNumber(party.votes, 0)} atkvæði · {formatNumber(percent)}%
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-slate-900">{party.seats}</div>
                          <div className="text-xs uppercase tracking-wide text-slate-500">sæti</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {electedCandidates.length > 0 && (
                <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 text-sm font-semibold text-slate-700">
                    Kjörnir fulltrúar, raðað eftir atkvæðafjölda lista
                  </div>
                  <div className="space-y-2">
                    {electedCandidates.map((item, index) => (
                      <div key={`${item.listName}-${item.candidate}`} className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                        <div>
                          <div className="font-medium text-slate-900">{index + 1}. {item.candidate}</div>
                          <div className="text-slate-600">{item.listName} · sæti #{item.listPosition} á lista</div>
                        </div>
                        <div className="whitespace-nowrap text-right text-slate-700">
                          <div className="font-semibold">{formatNumber(item.listVotes, 0)}</div>
                          <div className="text-xs text-slate-500">{formatNumber(item.listPercent)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {nextIn && lastAllocatedSeat && (
                <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-950">
                  <div className="font-semibold">Næstur inn</div>
                  <div className="mt-1">
                    <span className="font-medium">{nextIn.nextCandidate}</span> á {nextIn.name} væri næst/ur inn.
                  </div>
                  <div className="mt-1">
                    Listann vantar að minnsta kosti <span className="font-semibold">{formatNumber(nextIn.votesNeeded, 0)}</span> atkvæði til viðbótar til að ná næsta sæti miðað við óbreytt atkvæði annarra lista.
                  </div>
                  <div className="mt-2 text-xs text-blue-800">
                    Næsta d’Hondt-tala listans er {formatNumber(nextIn.nextQuotient)}. Síðasta úthlutaða sætið fór á {lastAllocatedSeat.winnerPartyName} með útkomutöluna {formatNumber(lastAllocatedSeat.quotient)}.
                  </div>
                </div>
              )}

              <div className="mt-4 rounded-xl bg-slate-100 p-3 text-sm text-slate-700">
                Fylgi hvers lista er reiknað út frá gildum atkvæðum til framboðslista, ekki af fjölda á kjörskrá.
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Úthlutun sæta, skref fyrir skref</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600">
                    <th className="px-3 py-2 font-semibold">Umferð</th>
                    <th className="px-3 py-2 font-semibold">Listi sem fékk sæti</th>
                    <th className="px-3 py-2 font-semibold">Deilt með</th>
                    <th className="px-3 py-2 font-semibold">Útkomutala</th>
                  </tr>
                </thead>
                <tbody>
                  {rounds.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-3 py-4 text-slate-500">
                        Sláðu inn atkvæði til að sjá úthlutun.
                      </td>
                    </tr>
                  ) : (
                    rounds.map((round) => (
                      <tr key={round.round} className="border-b border-slate-100">
                        <td className="px-3 py-2">{round.round}</td>
                        <td className="px-3 py-2 font-medium">{round.winnerPartyName}</td>
                        <td className="px-3 py-2">{round.divisor}</td>
                        <td className="px-3 py-2">{formatNumber(round.quotient)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function SummaryBox({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-100 p-3 text-sm text-slate-700">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-bold text-slate-900">{value}</div>
    </div>
  );
}
