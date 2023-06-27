--
-- PostgreSQL database dump
--

-- Dumped from database version 10.20
-- Dumped by pg_dump version 10.20

-- Started on 2022-04-17 19:40:43

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 1 (class 3079 OID 12924)
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- TOC entry 2863 (class 0 OID 0)
-- Dependencies: 1
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- TOC entry 595 (class 1247 OID 16404)
-- Name: categ_bijuterie; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.categ_bijuterie AS ENUM (
    'inel',
    'bratara',
    'cercei',
    'colier',
    'set'
);


ALTER TYPE public.categ_bijuterie OWNER TO postgres;

--
-- TOC entry 606 (class 1247 OID 16456)
-- Name: roluri; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.roluri AS ENUM (
    'admin',
    'moderator',
    'comun'
);


ALTER TYPE public.roluri OWNER TO postgres;

--
-- TOC entry 598 (class 1247 OID 16416)
-- Name: tipuri_produse; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipuri_produse AS ENUM (
    'argint',
    'aur roz',
    'aur alb',
    'aur galben'
);


ALTER TYPE public.tipuri_produse OWNER TO postgres;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 203 (class 1259 OID 16481)
-- Name: accesari; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accesari (
    id integer NOT NULL,
    ip character varying(100) NOT NULL,
    user_id integer,
    pagina character varying(500) NOT NULL,
    data_accesare timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.accesari OWNER TO postgres;

--
-- TOC entry 202 (class 1259 OID 16479)
-- Name: accesari_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.accesari_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.accesari_id_seq OWNER TO postgres;

--
-- TOC entry 2864 (class 0 OID 0)
-- Dependencies: 202
-- Name: accesari_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.accesari_id_seq OWNED BY public.accesari.id;


--
-- TOC entry 199 (class 1259 OID 16427)
-- Name: bijuterii; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bijuterii (
    id integer NOT NULL,
    nume character varying(100) NOT NULL,
    descriere text,
    pret numeric(8,2) NOT NULL,
    carate double precision NOT NULL,
    tip_produs public.tipuri_produse DEFAULT 'aur alb'::public.tipuri_produse,
    tip_metal integer NOT NULL,
    categorie public.categ_bijuterie DEFAULT 'inel'::public.categ_bijuterie,
    culoare_piatra character varying(50),
    stil character varying[],
    posibilitate_personalizare boolean DEFAULT false NOT NULL,
    imagine character varying(300),
    data_adaugare timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT bijuterii_carate_check CHECK ((carate >= (0)::double precision)),
    CONSTRAINT bijuterii_tip_metal_check CHECK ((tip_metal >= 0))
);


ALTER TABLE public.bijuterii OWNER TO postgres;

--
-- TOC entry 198 (class 1259 OID 16425)
-- Name: bijuterii_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bijuterii_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.bijuterii_id_seq OWNER TO postgres;

--
-- TOC entry 2866 (class 0 OID 0)
-- Dependencies: 198
-- Name: bijuterii_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bijuterii_id_seq OWNED BY public.bijuterii.id;


--
-- TOC entry 197 (class 1259 OID 16396)
-- Name: tabel; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tabel (
    id integer NOT NULL,
    nume character varying(100) NOT NULL,
    pret integer DEFAULT 100 NOT NULL
);


ALTER TABLE public.tabel OWNER TO postgres;

--
-- TOC entry 196 (class 1259 OID 16394)
-- Name: tabel_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.tabel ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tabel_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 201 (class 1259 OID 16465)
-- Name: utilizatori; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.utilizatori (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    nume character varying(100) NOT NULL,
    prenume character varying(100) NOT NULL,
    parola character varying(500) NOT NULL,
    rol public.roluri DEFAULT 'comun'::public.roluri NOT NULL,
    email character varying(100) NOT NULL,
    culoare_chat character varying(50) NOT NULL,
    data_adaugare timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    cod character varying(200),
    confirmat_mail boolean DEFAULT false
);


ALTER TABLE public.utilizatori OWNER TO postgres;

--
-- TOC entry 200 (class 1259 OID 16463)
-- Name: utilizatori_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.utilizatori_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.utilizatori_id_seq OWNER TO postgres;

--
-- TOC entry 2870 (class 0 OID 0)
-- Dependencies: 200
-- Name: utilizatori_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.utilizatori_id_seq OWNED BY public.utilizatori.id;


--
-- TOC entry 2712 (class 2604 OID 16484)
-- Name: accesari id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accesari ALTER COLUMN id SET DEFAULT nextval('public.accesari_id_seq'::regclass);


--
-- TOC entry 2701 (class 2604 OID 16430)
-- Name: bijuterii id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bijuterii ALTER COLUMN id SET DEFAULT nextval('public.bijuterii_id_seq'::regclass);


--
-- TOC entry 2708 (class 2604 OID 16468)
-- Name: utilizatori id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utilizatori ALTER COLUMN id SET DEFAULT nextval('public.utilizatori_id_seq'::regclass);


--
-- TOC entry 2855 (class 0 OID 16481)
-- Dependencies: 203
-- Data for Name: accesari; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 2851 (class 0 OID 16427)
-- Dependencies: 199
-- Data for Name: bijuterii; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.bijuterii (id, nume, descriere, pret, carate, tip_produs, tip_metal, categorie, culoare_piatra, stil, posibilitate_personalizare, imagine, data_adaugare) VALUES (12, 'Inel din aur galben de 18K cu diamante de 0.201ct', 'Inel drăguțel', 3665.00, 0.20100000000000001, 'aur galben', 18, 'inel', 'alb', '{"Single Stone"}', true, NULL, '2022-03-31 17:18:25.963045');
INSERT INTO public.bijuterii (id, nume, descriere, pret, carate, tip_produs, tip_metal, categorie, culoare_piatra, stil, posibilitate_personalizare, imagine, data_adaugare) VALUES (13, 'Inel din aur alb de 18K cu diamante de 0.75ct', 'Foarte frumos inel', 29625.00, 0.75, 'aur alb', 18, 'inel', 'alb', '{"3 Stones"}', true, NULL, '2022-03-31 17:18:25.963045');
INSERT INTO public.bijuterii (id, nume, descriere, pret, carate, tip_produs, tip_metal, categorie, culoare_piatra, stil, posibilitate_personalizare, imagine, data_adaugare) VALUES (14, 'Inel din aur alb de 18K cu diamant albastru de 0.31ct', 'Este pur si șimplu superb.', 5392.00, 0.31, 'aur alb', 18, 'inel', 'albastru', '{"Halo Pavé"}', false, NULL, '2022-03-31 17:18:25.963045');
INSERT INTO public.bijuterii (id, nume, descriere, pret, carate, tip_produs, tip_metal, categorie, culoare_piatra, stil, posibilitate_personalizare, imagine, data_adaugare) VALUES (15, 'Cercei din aur roz de 14K cu diamante de 0.53ct', 'Cercei în forma de cerculeț și roz pe deasupra', 6260.00, 0.53000000000000003, 'aur roz', 14, 'cercei', 'alb', '{Stud}', false, NULL, '2022-03-31 17:18:25.963045');
INSERT INTO public.bijuterii (id, nume, descriere, pret, carate, tip_produs, tip_metal, categorie, culoare_piatra, stil, posibilitate_personalizare, imagine, data_adaugare) VALUES (16, 'Cercei lungi cu fluturași din aur galben de 14K și diamante de 0.69ct', 'Ceva minunat', 4096.00, 0.68999999999999995, 'aur galben', 14, 'cercei', 'alb', '{"Drop Dangle","Lever Back"}', false, NULL, '2022-03-31 17:18:25.963045');


--
-- TOC entry 2849 (class 0 OID 16396)
-- Dependencies: 197
-- Data for Name: tabel; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.tabel (id, nume, pret) OVERRIDING SYSTEM VALUE VALUES (1, 'abcd', 200);
INSERT INTO public.tabel (id, nume, pret) OVERRIDING SYSTEM VALUE VALUES (2, 'mouse', 100);
INSERT INTO public.tabel (id, nume, pret) OVERRIDING SYSTEM VALUE VALUES (3, 'zzzzzzz', 50);


--
-- TOC entry 2853 (class 0 OID 16465)
-- Dependencies: 201
-- Data for Name: utilizatori; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 2871 (class 0 OID 0)
-- Dependencies: 202
-- Name: accesari_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.accesari_id_seq', 1, false);


--
-- TOC entry 2872 (class 0 OID 0)
-- Dependencies: 198
-- Name: bijuterii_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bijuterii_id_seq', 16, true);


--
-- TOC entry 2873 (class 0 OID 0)
-- Dependencies: 196
-- Name: tabel_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tabel_id_seq', 3, true);


--
-- TOC entry 2874 (class 0 OID 0)
-- Dependencies: 200
-- Name: utilizatori_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.utilizatori_id_seq', 1, false);


--
-- TOC entry 2725 (class 2606 OID 16490)
-- Name: accesari accesari_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accesari
    ADD CONSTRAINT accesari_pkey PRIMARY KEY (id);


--
-- TOC entry 2717 (class 2606 OID 16454)
-- Name: bijuterii bijuterii_nume_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bijuterii
    ADD CONSTRAINT bijuterii_nume_key UNIQUE (nume);


--
-- TOC entry 2719 (class 2606 OID 16441)
-- Name: bijuterii bijuterii_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bijuterii
    ADD CONSTRAINT bijuterii_pkey PRIMARY KEY (id);


--
-- TOC entry 2715 (class 2606 OID 16401)
-- Name: tabel tabel_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tabel
    ADD CONSTRAINT tabel_pkey PRIMARY KEY (id);


--
-- TOC entry 2721 (class 2606 OID 16476)
-- Name: utilizatori utilizatori_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utilizatori
    ADD CONSTRAINT utilizatori_pkey PRIMARY KEY (id);


--
-- TOC entry 2723 (class 2606 OID 16478)
-- Name: utilizatori utilizatori_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utilizatori
    ADD CONSTRAINT utilizatori_username_key UNIQUE (username);


--
-- TOC entry 2726 (class 2606 OID 16491)
-- Name: accesari accesari_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accesari
    ADD CONSTRAINT accesari_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.utilizatori(id);


--
-- TOC entry 2865 (class 0 OID 0)
-- Dependencies: 199
-- Name: TABLE bijuterii; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.bijuterii TO maria;


--
-- TOC entry 2867 (class 0 OID 0)
-- Dependencies: 198
-- Name: SEQUENCE bijuterii_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.bijuterii_id_seq TO maria;


--
-- TOC entry 2868 (class 0 OID 0)
-- Dependencies: 197
-- Name: TABLE tabel; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.tabel TO maria;


--
-- TOC entry 2869 (class 0 OID 0)
-- Dependencies: 196
-- Name: SEQUENCE tabel_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.tabel_id_seq TO maria;


-- Completed on 2022-04-17 19:40:44

--
-- PostgreSQL database dump complete
--

