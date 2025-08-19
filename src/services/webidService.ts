import { Namespace, parse, graph, sym, type NamedNode } from 'rdflib';

const VCARD = Namespace('http://www.w3.org/2006/vcard/ns#');
const FOAF = Namespace('http://xmlns.com/foaf/0.1/');
const SOLID = Namespace('http://www.w3.org/ns/solid/terms#');
const SPACE = Namespace('http://www.w3.org/ns/pim/space#');
const SOC = Namespace(
  'https://solidos.github.io/profile-pane/src/ontology/socialMedia.ttl#'
);

export interface SocialAccount {
  type: string;
  handle: string;
  url?: string;
}

export interface Profile {
  webid: string;
  name?: string;
  nickname?: string;
  image?: string;
  email?: string;
  homepage?: string;
  birthday?: string;
  age?: number;
  organization?: string;
  role?: string;
  bio?: string;
  pronouns?: {
    subject: string;
    object: string;
    possessive: string;
  };
  socialAccounts: SocialAccount[];

  storage: string[];
  inbox?: string;
  colors?: {
    background: string;
    highlight: string;
  };
  languages: string[];
  friends: string[];
}

export async function fetchProfile(webid: string): Promise<Profile> {
  const store = graph();

  const response = await fetch(webid, {
    headers: { Accept: 'text/turtle' },
  });

  const data = await response.text();

  await new Promise<void>((resolve, reject) => {
    parse(data, store, webid, 'text/turtle', (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });

  const webidSym = sym(webid);

  const nameNode = store.any(webidSym, VCARD('fn'), null);
  const nicknameNode = store.any(webidSym, FOAF('nick'), null);
  const imageNode = store.any(webidSym, VCARD('hasPhoto'), null);
  const emailNode = store.any(webidSym, VCARD('hasEmail'), null);
  const homepageNode = store.any(webidSym, VCARD('url'), null);

  const orgNode = store.any(webidSym, VCARD('organization-name'), null);
  const roleNode = store.any(webidSym, VCARD('role'), null);
  const bioNode = store.any(webidSym, VCARD('note'), null);

  const birthdayNode = store.any(webidSym, VCARD('bday'), null);
  const subjectPronoun = store.any(
    webidSym,
    SOLID('preferredSubjectPronoun'),
    null
  );
  const objectPronoun = store.any(
    webidSym,
    SOLID('preferredObjectPronoun'),
    null
  );
  const possessivePronoun = store.any(
    webidSym,
    SOLID('preferredRelativePronoun'),
    null
  );

  const bgColor = store.any(webidSym, SOLID('profileBackgroundColor'), null);
  const highlightColor = store.any(
    webidSym,
    SOLID('profileHighlightColor'),
    null
  );

  const storageNodes = store.each(webidSym, SPACE('storage'), null);
  const inboxNode = store.any(
    webidSym,
    sym('http://www.w3.org/ns/ldp#inbox'),
    null
  );
  const friendsNodes = store.each(webidSym, FOAF('knows'), null);

  let email = '';
  if (emailNode) {
    const emailValue = store.any(emailNode as NamedNode, VCARD('value'), null);
    if (emailValue) {
      email = emailValue.value.replace('mailto:', '');
    }
  }

  // Extract social accounts
  const socialAccounts: SocialAccount[] = [];

  const mastodonAccounts = store.match(
    null,
    sym('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
    SOC('MastodonAccount'),
    null
  );
  const orcidAccounts = store.match(
    null,
    sym('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
    SOC('OrcidAccount'),
    null
  );
  const blueskyAccounts = store.match(
    null,
    sym('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
    SOC('BlueSkyAccount'),
    null
  );
  const matrixAccounts = store.match(
    null,
    sym('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
    SOC('MatrixAccount'),
    null
  );

  const allDirectAccounts = [
    ...mastodonAccounts.map((q) => ({ subject: q.subject, type: 'Mastodon' })),
    ...orcidAccounts.map((q) => ({ subject: q.subject, type: 'ORCID' })),
    ...blueskyAccounts.map((q) => ({ subject: q.subject, type: 'BlueSky' })),
    ...matrixAccounts.map((q) => ({ subject: q.subject, type: 'Matrix' })),
  ];

  allDirectAccounts.forEach((account) => {
    const handleNode = store.any(account.subject, FOAF('accountName'), null);
    if (handleNode) {
      const accountData: SocialAccount = {
        type: account.type,
        handle: handleNode.value,
      };

      const urlNode =
        store.any(account.subject, FOAF('accountServiceHomepage'), null) ||
        store.any(account.subject, VCARD('url'), null) ||
        store.any(account.subject, sym('http://schema.org/url'), null);

      if (urlNode) {
        accountData.url = urlNode.value;
      }

      socialAccounts.push(accountData);
    }
  });

  // Calculate age from birthday
  let age: number | undefined;
  if (birthdayNode) {
    const birthDate = new Date(birthdayNode.value);
    const today = new Date();
    age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
  }

  return {
    webid,
    name: nameNode?.value,
    nickname: nicknameNode?.value,
    image: imageNode?.value,
    email: email || undefined,
    homepage: homepageNode?.value,
    birthday: birthdayNode?.value,
    age,
    organization: orgNode?.value,
    role: roleNode?.value,
    bio: bioNode?.value?.trim(),
    pronouns: subjectPronoun
      ? {
          subject: subjectPronoun.value,
          object: objectPronoun?.value || '',
          possessive: possessivePronoun?.value || '',
        }
      : undefined,
    socialAccounts,
    storage: storageNodes.map((node) => node.value),
    inbox: inboxNode?.value,
    colors: bgColor
      ? {
          background: bgColor.value,
          highlight: highlightColor?.value || '#341bee',
        }
      : undefined,
    languages: [],
    friends: friendsNodes.map((node) => node.value),
  };
}
