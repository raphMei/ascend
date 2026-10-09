import { useData } from '@/state/DataContext';

export function SignInScreen() {
  const { state, signIn } = useData();
  return (
    <div className="center">
      <img className="logo" src={`${import.meta.env.BASE_URL}icon.svg`} alt="" />
      <div><h1>Ascend</h1><p style={{ marginTop: 8 }}>Un jour à la fois, deviens une meilleure version de toi-même.</p></div>
      <div>
        <button type="button" className="btn primary" onClick={() => void signIn()} style={{ width: '100%', fontSize: 18, padding: 14 }}>Continuer avec Google</button>
        {state.error && <p className="err" style={{ marginTop: 12 }}>Connexion impossible : {state.error}</p>}
      </div>
    </div>
  );
}
