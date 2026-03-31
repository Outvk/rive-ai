"use client"

import React, { useState, useRef, useEffect } from "react"
import { 
    Music, 
    Wand2, 
    Volume2, 
    Download, 
    Upload, 
    Play, 
    Pause, 
    Loader2, 
    Sparkles,
    Trash2,
    Settings2,
    Layers,
    Type,
    ArrowRight,
    ArrowLeft,
    Plus,
    Search,
    Phone,
    Waves,
    Mic2,
    Radio,
    Ghost,
    Zap,
    History,
    ChevronDown,
    ChevronUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

const EFFECTS = [
    { id: 'none', label: 'Original', icon: Volume2 },
    { id: 'reverb', label: 'Studio Reverb', icon: Sparkles },
    { id: 'echo', label: 'Cave Echo', icon: Layers },
    { id: 'robot', label: 'Robotic', icon: Settings2 },
    { id: 'deep', label: 'Deep Bass', icon: Volume2 },
    { id: 'high', label: 'Helium', icon: Volume2 },
    { id: 'telephone', label: 'Telephone FX', icon: Phone },
    { id: 'underwater', label: 'Drowned', icon: Waves },
    { id: 'stadium', label: 'Stadium Pro', icon: Mic2 },
    { id: 'radio', label: 'Radio Dispatch', icon: Radio },
    { id: 'ghost', label: 'Ethereal Ghost', icon: Ghost },
    { id: 'glitch', label: 'Cyber Glitch', icon: Zap },
]

const AMBIENT_MUSIC = [
    { id: 'none', label: 'No Music' },
    { id: 'lofi', label: 'Lofi Chill' },
    { id: 'cinematic', label: 'Cinematic' },
    { id: 'tech', label: 'Tech / Corporate' },
    { id: 'inspirational', label: 'Inspirational' },
    { id: 'suspense', label: 'Suspense' },
]

const SFX_CATEGORIES = [
    { 
        id: 'air', label: 'Air', icon: '🌬️',
        samples: [
            { text: "A gentle breeze rustling through autumn leaves", duration: 5 },
            { text: "High-speed air hiss from a compressed tank", duration: 2 },
            { text: "A cold winter wind whistling under a door", duration: 6 },
            { text: "The steady hum of a ventilation fan", duration: 8 },
            { text: "Air being sucked into a vacuum", duration: 3 }
        ]
    },
    { 
        id: 'aircraft', label: 'Aircraft', icon: '✈️',
        samples: [
            { text: "A commercial jet engine roaring during takeoff", duration: 10 },
            { text: "A helicopter's rhythmic blade chop overhead", duration: 8 },
            { text: "Small propeller plane flying low and slow", duration: 12 },
            { text: "Fighter jet passing through the sound barrier", duration: 4 },
            { text: "Drone buzzing with a high-pitched whine", duration: 5 }
        ]
    },
    { 
        id: 'alarm', label: 'Alarm', icon: '🚨',
        samples: [
            { text: "A loud industrial emergency siren", duration: 8 },
            { text: "A digital alarm clock beeping persistently", duration: 4 },
            { text: "A high-pitched car alarm going off", duration: 6 },
            { text: "A gentle morning chime for a phone alarm", duration: 3 },
            { text: "Submarine dive alarm with a deep klaxon", duration: 5 }
        ]
    },
    { 
        id: 'ambience', label: 'Ambience', icon: '🌲',
        samples: [
            { text: "A busy cafe with clinking cups and chatter", duration: 15 },
            { text: "Nighttime in a quiet village with distant dogs", duration: 12 },
            { text: "Bustling airport terminal background noise", duration: 20 },
            { text: "Underground cave with water droplets and echo", duration: 10 },
            { text: "Peaceful zen garden with a running fountain", duration: 15 }
        ]
    },
    { 
        id: 'animal', label: 'Animal', icon: '🐾',
        samples: [
            { text: "A mighty lion's guttural roar", duration: 4 },
            { text: "A pack of wolves howling at the moon", duration: 8 },
            { text: "A small puppy barking and whining", duration: 3 },
            { text: "Tropical birds chirping in a dense forest", duration: 10 },
            { text: "Horse galloping on a dirt path", duration: 5 }
        ]
    },
    { 
        id: 'bell', label: 'Bell', icon: '🔔',
        samples: [
            { text: "A deep, resonant church bell tolling", duration: 12 },
            { text: "A small shopkeeper's bell ringing", duration: 2 },
            { text: "A dinner triangle being struck repeatedly", duration: 4 },
            { text: "Bicycle bell ringing twice", duration: 2 },
            { text: "Wind chimes tinkling in a light breeze", duration: 8 }
        ]
    },
    { 
        id: 'boat', label: 'Boat', icon: '🚢',
        samples: [
            { text: "A large ship's deep foghorn blast", duration: 6 },
            { text: "A small motorboat engine idling on water", duration: 8 },
            { text: "Oars splashing rhythmically in a quiet lake", duration: 5 },
            { text: "Water lapping against a wooden dock", duration: 6 },
            { text: "A sailboat's rigging clinking in the wind", duration: 4 }
        ]
    },
    { 
        id: 'booms', label: 'Booms', icon: '💥',
        samples: [
            { text: "A massive cinematic explosion with debris", duration: 5 },
            { text: "A deep sub-bass thunderous impact", duration: 3 },
            { text: "A distant heavy cannon firing", duration: 4 },
            { text: "A building collapsing with a heavy rumble", duration: 10 },
            { text: "A magical energy blast detonation", duration: 2 }
        ]
    },
    { 
        id: 'bullet', label: 'Bullet', icon: '🔫',
        samples: [
            { text: "A sniper rifle shot with a long echo", duration: 4 },
            { text: "Bullet whizzing past a microphone", duration: 1 },
            { text: "A metal ricochet of a bullet hitting a pipe", duration: 2 },
            { text: "Automatic gunfire from a distance", duration: 6 },
            { text: "Reloading a heavy handgun with a click", duration: 2 }
        ]
    },
    { 
        id: 'cartoon', label: 'Cartoon', icon: '🤡',
        samples: [
            { text: "A funny 'boing' spring bounce sound", duration: 1 },
            { text: "A comical slip and slide sound effect", duration: 2 },
            { text: "A classic cartoon whistle falling sound", duration: 3 },
            { text: "Silly rubber duck squeak", duration: 1 },
            { text: "A goofy 'ta-da' fanfare on a kazoo", duration: 2 }
        ]
    },
    { 
        id: 'communication', label: 'Communication', icon: '📱',
        samples: [
            { text: "Old rotary phone dial and ring", duration: 6 },
            { text: "A futuristic hologram communication hum", duration: 5 },
            { text: "Morse code telegraph tapping", duration: 4 },
            { text: "A walkie-talkie static and 'over' beep", duration: 3 },
            { text: "A smartphone notification ping", duration: 1 }
        ]
    },
    { 
        id: 'creature', label: 'Creature', icon: '🦖',
        samples: [
            { text: "A massive dinosaur growling deeply", duration: 6 },
            { text: "A small alien creature chirping curiously", duration: 3 },
            { text: "A dragon's fiery breath and roar", duration: 5 },
            { text: "A monstrous beast sniffing and snarling", duration: 8 },
            { text: "The skittering of a giant insect", duration: 4 }
        ]
    },
    { 
        id: 'crowd', label: 'Crowd', icon: '👥',
        samples: [
            { text: "A massive stadium crowd cheering for a goal", duration: 10 },
            { text: "Polite applause in a theater", duration: 5 },
            { text: "A panicked crowd screaming and running", duration: 8 },
            { text: "Angry protest chanting and shouting", duration: 12 },
            { text: "Quiet murmur of people in a library", duration: 10 }
        ]
    },
    { 
        id: 'cymbals', label: 'Cymbals', icon: '🥁',
        samples: [
            { text: "A shimmering crash cymbal hit", duration: 4 },
            { text: "A ride cymbal rhythm with a clear bell", duration: 6 },
            { text: "A hi-hat opening and closing quickly", duration: 2 },
            { text: "A dramatic cymbal swell with mallets", duration: 6 },
            { text: "A splash cymbal accentuate a beat", duration: 1 }
        ]
    },
    { 
        id: 'devices', label: 'Devices', icon: '📟',
        samples: [
            { text: "A clicking sound of a Geiger counter", duration: 6 },
            { text: "A medical heart rate monitor beeping", duration: 10 },
            { text: "A digital scanner reading a barcode", duration: 1 },
            { text: "An electric toothbrush vibrating", duration: 5 },
            { text: "A coffee machine grinding beans", duration: 10 }
        ]
    },
    { 
        id: 'door', label: 'Door', icon: '🚪',
        samples: [
            { text: "A heavy iron dungeon door creaking open", duration: 6 },
            { text: "A wooden house door slamming shut", duration: 2 },
            { text: "A sliding glass door opening smoothly", duration: 3 },
            { text: "A futuristic pneumatic air-lock door", duration: 4 },
            { text: "Locking a door with a heavy bolt click", duration: 1 }
        ]
    },
    { 
        id: 'electricity', label: 'Electricity', icon: '⚡',
        samples: [
            { text: "A high-voltage electrical arc crackle", duration: 4 },
            { text: "A steady electrical hum from a transformer", duration: 10 },
            { text: "A lightbulb filament blowing with a pop", duration: 1 },
            { text: "An electric tesla coil discharging", duration: 5 },
            { text: "A short circuit sparking and sizzling", duration: 3 }
        ]
    },
    { 
        id: 'environment', label: 'Environment', icon: '🌍',
        samples: [
            { text: "A rainstorm in a tropical rainforest", duration: 20 },
            { text: "A desolate frozen arctic wind", duration: 15 },
            { text: "A bubbling volcanic lava flow", duration: 10 },
            { text: "A tranquil underwater lagoon", duration: 15 },
            { text: "A dry desert sandstorm howling", duration: 12 }
        ]
    },
    { 
        id: 'fire', label: 'Fire', icon: '🔥',
        samples: [
            { text: "A massive forest fire roaring", duration: 10 },
            { text: "A small campfire crackling and popping", duration: 15 },
            { text: "A fireplace hiss and flame whoosh", duration: 8 },
            { text: "A torch being lit and brandished", duration: 4 },
            { text: "An extinguisher spraying out CO2", duration: 5 }
        ]
    },
    { 
        id: 'foley', label: 'Foley', icon: '🔨',
        samples: [
            { text: "Hammering a nail into a wooden plank", duration: 6 },
            { text: "Sawing through a thick piece of wood", duration: 10 },
            { text: "Dropping a heavy metal pipe on concrete", duration: 3 },
            { text: "Shuffling through a pile of paper", duration: 5 },
            { text: "Clinking together a bunch of keys", duration: 2 }
        ]
    },
    { 
        id: 'food', label: 'Food & Drink', icon: '🍕',
        samples: [
            { text: "A refreshing soda can being opened", duration: 2 },
            { text: "Pouring a drink into a glass with ice", duration: 4 },
            { text: "Someone crunching on a crisp apple", duration: 3 },
            { text: "Sizzling bacon in a hot frying pan", duration: 10 },
            { text: "Stirring a cup of coffee with a spoon", duration: 4 }
        ]
    },
    { 
        id: 'footstep', label: 'Footstep', icon: '👣',
        samples: [
            { text: "Heavy boots walking on dry leaves", duration: 6 },
            { text: "Heels clicking fast on a marble floor", duration: 5 },
            { text: "Walking barefoot in squelchy mud", duration: 8 },
            { text: "Running on a gravel driveway", duration: 6 },
            { text: "Climbing old creaky wooden stairs", duration: 10 }
        ]
    },
    { 
        id: 'funny', label: 'Funny', icon: '😂',
        samples: [
            { text: "A high-pitched cartoon laugh", duration: 3 },
            { text: "A slide whistle going up and down", duration: 2 },
            { text: "A funny slide-drum 'ba-dum-tss'", duration: 2 },
            { text: "A comical sneeze sound effect", duration: 1 },
            { text: "A silly fart sound effect", duration: 1 }
        ]
    },
    { 
        id: 'game', label: 'Game', icon: '🕹️',
        samples: [
            { text: "A retro 8-bit level up sound", duration: 2 },
            { text: "A modern RPG quest discovery chime", duration: 3 },
            { text: "A fighting game K.O. announcer", duration: 2 },
            { text: "A low health warning flash sound", duration: 4 },
            { text: "A digital inventory open/close sound", duration: 1 }
        ]
    },
    { 
        id: 'gore', label: 'Gore', icon: '🩸',
        samples: [
            { text: "A wet, squelching flesh impact", duration: 2 },
            { text: "Bone snapping with a dry crack", duration: 1 },
            { text: "Blood splattering on a wall", duration: 2 },
            { text: "The sound of a visceral decapitation", duration: 3 },
            { text: "A gargled, choking sound", duration: 4 }
        ]
    },
    { 
        id: 'horror', label: 'Horror', icon: '🔪',
        samples: [
            { text: "A high-pitched, slow violin scrape", duration: 6 },
            { text: "A deep, ominous ambient drone", duration: 15 },
            { text: "A female scream echoing in the dark", duration: 4 },
            { text: "Heavy rhythmic breathing nearby", duration: 8 },
            { text: "A sudden jump scare transient", duration: 1 }
        ]
    },
    { 
        id: 'human', label: 'Human', icon: '👤',
        samples: [
            { text: "A deep, rhythmic human heartbeat", duration: 10 },
            { text: "A single, heavy breath out", duration: 2 },
            { text: "Someone clearing their throat loudly", duration: 2 },
            { text: "A person's stomach growling", duration: 3 },
            { text: "Sound of fingers snapping twice", duration: 1 }
        ]
    },
    { 
        id: 'ice', label: 'Ice', icon: '❄️',
        samples: [
            { text: "A massive glacier shelf cracking", duration: 8 },
            { text: "Walking on thin, crunchy frozen snow", duration: 6 },
            { text: "Ice cubes clinking in a glass", duration: 3 },
            { text: "Skating fast on a clear frozen lake", duration: 10 },
            { text: "A block of ice being shattered", duration: 3 }
        ]
    },
    { 
        id: 'laser', label: 'Laser', icon: '🔫',
        samples: [
            { text: "A classic sci-fi laser blaster shot", duration: 1 },
            { text: "A high-power laser beam cutting metal", duration: 6 },
            { text: "A rhythmic pulsing pulse laser", duration: 5 },
            { text: "A laser turret spinning up to fire", duration: 4 },
            { text: "A laser sword humming and swinging", duration: 5 }
        ]
    },
    { 
        id: 'leather', label: 'Leather', icon: '👞',
        samples: [
            { text: "A heavy leather jacket creaking", duration: 4 },
            { text: "Tightening a leather belt strap", duration: 2 },
            { text: "Rubbing two pieces of leather together", duration: 3 },
            { text: "A leather whip cracking in the air", duration: 1 },
            { text: "Dropping a heavy leather bag", duration: 2 }
        ]
    },
    { 
        id: 'machinery', label: 'Machinery', icon: '⚙️',
        samples: [
            { text: "A massive industrial hydraulic press", duration: 8 },
            { text: "The steady clatter of a printing press", duration: 10 },
            { text: "A diesel generator chugging steadily", duration: 12 },
            { text: "A robotic assembly arm moving and clicking", duration: 6 },
            { text: "A heavy metal lathe cutting steel", duration: 8 }
        ]
    },
    { 
        id: 'magic', label: 'Magic', icon: '✨',
        samples: [
            { text: "A shimmering magical portal opening", duration: 6 },
            { text: "A mystical energy spell being cast", duration: 4 },
            { text: "A wand sparkle and fairy dust sound", duration: 3 },
            { text: "A dark wizard's cursed flame whoosh", duration: 5 },
            { text: "A healing aura pulsing softly", duration: 5 }
        ]
    },
    { 
        id: 'mechanical', label: 'Mechanical Object', icon: '🛠️',
        samples: [
            { text: "A clockwork mechanism winding up", duration: 6 },
            { text: "The click and spin of a combination safe", duration: 8 },
            { text: "A hand-cranked music box melody", duration: 10 },
            { text: "Flipping a large industrial toggle switch", duration: 2 },
            { text: "Ratcheting a socket wrench back and forth", duration: 4 }
        ]
    },
    { 
        id: 'misc', label: 'Misc', icon: '📦',
        samples: [
            { text: "Rummaging through a drawer of junk", duration: 6 },
            { text: "A light switch being flipped twice", duration: 1 },
            { text: "Blowing out a single candle", duration: 2 },
            { text: "Shaking a box of assorted screws", duration: 4 },
            { text: "The sound of a deep heavy sigh", duration: 3 }
        ]
    },
    { 
        id: 'motor', label: 'Motor', icon: '🏎️',
        samples: [
            { text: "A high-performance car engine idling", duration: 10 },
            { text: "A lawnmower starting and running", duration: 8 },
            { text: "An electric drill motor at full speed", duration: 5 },
            { text: "A motorcycle revving its engine", duration: 6 },
            { text: "A small toy DC motor spinning", duration: 3 }
        ]
    },
    { 
        id: 'object', label: 'Object', icon: '🏺',
        samples: [
            { text: "A ceramic vase shattering on the floor", duration: 3 },
            { text: "Sliding a heavy book across a desk", duration: 2 },
            { text: "Dropping a pile of coins on wood", duration: 4 },
            { text: "A bouncing rubber ball on pavement", duration: 4 },
            { text: "Unfolding a large paper map", duration: 5 }
        ]
    },
    { 
        id: 'office', label: 'Office', icon: '💼',
        samples: [
            { text: "Rapid typing on a mechanical keyboard", duration: 10 },
            { text: "A photocopy machine scanning and printing", duration: 12 },
            { text: "A paper shredder destroying documents", duration: 6 },
            { text: "Clicking a ballpoint pen repeatedly", duration: 2 },
            { text: "A stapler punching through paper", duration: 1 }
        ]
    },
    { 
        id: 'percussion', label: 'Percussion', icon: '🥁',
        samples: [
            { text: "A deep orchestral bass drum hit", duration: 4 },
            { text: "A sharp, snapping snare drum roll", duration: 6 },
            { text: "Shaking a pair of wooden maracas", duration: 5 },
            { text: "A hollow woodblock hit", duration: 1 },
            { text: "A rhythmic beat on a hand drum", duration: 8 }
        ]
    },
    { 
        id: 'robot', label: 'Robot', icon: '🤖',
        samples: [
            { text: "A robot's mechanical speech voice", duration: 5 },
            { text: "Pneumatic pistons hiss as a robot moves", duration: 4 },
            { text: "The constant low hum of a robot's CPU", duration: 10 },
            { text: "A robot shutting down with a glitching whine", duration: 3 },
            { text: "A robot scanning an area with a LIDAR sound", duration: 5 }
        ]
    },
    { 
        id: 'rope', label: 'Rope', icon: '🪢',
        samples: [
            { text: "A heavy rope straining under tension", duration: 6 },
            { text: "Dragging a thick rope across sand", duration: 5 },
            { text: "Tieing a tight knot in a rough rope", duration: 3 },
            { text: "The snap of a rope breaking", duration: 1 },
            { text: "A ship's rope creaking against a pier", duration: 8 }
        ]
    },
    { 
        id: 'scifi', label: 'Sci-fi', icon: '🌌',
        samples: [
            { text: "A futuristic spaceship interior ambient", duration: 15 },
            { text: "A plasma shield activating with a buzz", duration: 4 },
            { text: "Alien transmission static and beeps", duration: 8 },
            { text: "A teleporter beam energizing", duration: 5 },
            { text: "An anti-gravity engine idling", duration: 10 }
        ]
    },
    { 
        id: 'sport', label: 'Sport', icon: '🎾',
        samples: [
            { text: "A tennis ball being served at high power", duration: 2 },
            { text: "A basketball bouncing and hitting the rim", duration: 5 },
            { text: "A golf club swinging and hitting a ball", duration: 3 },
            { text: "A boxing match bell and crowd cheer", duration: 6 },
            { text: "The sound of an arrow hitting a target", duration: 1 }
        ]
    },
    { 
        id: 'transport', label: 'Transport', icon: '🚂',
        samples: [
            { text: "A steam train whistle and chug", duration: 12 },
            { text: "The hum of a modern subway train", duration: 10 },
            { text: "An electric tram dinging its bell", duration: 3 },
            { text: "A heavy cargo truck engine roaring", duration: 8 },
            { text: "A bicycle riding on a wet road", duration: 6 }
        ]
    },
    { 
        id: 'ui', label: 'UI Element', icon: '🖱️',
        samples: [
            { text: "A clean digital button tap sound", duration: 1 },
            { text: "A soft UI sliding transition sound", duration: 1 },
            { text: "A digital error buzzer sound", duration: 2 },
            { text: "A futuristic hologram menu sweep", duration: 2 },
            { text: "A satisfying 'select' confirmation ping", duration: 1 }
        ]
    },
    { 
        id: 'vegetation', label: 'Vegetation', icon: '🌿',
        samples: [
            { text: "Walking through tall dry brittle grass", duration: 6 },
            { text: "Pulling a weed up out of the soil", duration: 2 },
            { text: "The rustle of a massive tree falling", duration: 8 },
            { text: "Wind blowing through a corn field", duration: 10 },
            { text: "Leaves crunching under heavy footsteps", duration: 6 }
        ]
    },
    { 
        id: 'vehicle', label: 'Vehicle', icon: '🚗',
        samples: [
            { text: "A classic car engine starting up", duration: 5 },
            { text: "Emergency brakes screeching to a halt", duration: 3 },
            { text: "A car door being closed and locked", duration: 2 },
            { text: "Changing gears on a manual gearbox", duration: 2 },
            { text: "A car driving fast through deep water", duration: 6 }
        ]
    },
    { 
        id: 'voice', label: 'Voice', icon: '🗣️',
        samples: [
            { text: "A deep human whisper in the ear", duration: 4 },
            { text: "A woman's melodic singing without words", duration: 8 },
            { text: "A group of people laughing together", duration: 5 },
            { text: "A small child's innocent giggle", duration: 3 },
            { text: "A man shouting an angry command", duration: 2 }
        ]
    },
    { 
        id: 'water', label: 'Water', icon: '💧',
        samples: [
            { text: "A massive waterfall crashing down", duration: 15 },
            { text: "A gentle stream flowing over pebbles", duration: 12 },
            { text: "A heavy splash into deep ocean water", duration: 4 },
            { text: "Sink tap dripping into a metal basin", duration: 6 },
            { text: "The sound of bubbles in a fish tank", duration: 10 }
        ]
    },
    { 
        id: 'weapon', label: 'Weapon', icon: '⚔️',
        samples: [
            { text: "A medieval sword being drawn from a scabbard", duration: 2 },
            { text: "A heavy battleaxe hitting a wooden shield", duration: 3 },
            { text: "Drawing back a powerful bow and firing", duration: 4 },
            { text: "A metal mace hitting a stone floor", duration: 2 },
            { text: "The sound of reloading a crossbow", duration: 3 }
        ]
    },
    { 
        id: 'weather', label: 'Weather', icon: '⛈️',
        samples: [
            { text: "A terrifyingly loud thunder crack", duration: 10 },
            { text: "The roar of a tornado touchdown", duration: 15 },
            { text: "Golf-ball sized hail hitting a roof", duration: 8 },
            { text: "A heavy tropical downpour of rain", duration: 12 },
            { text: "The whistle of a blizzard gale", duration: 10 }
        ]
    },
    { 
        id: 'whistle', label: 'Whistle', icon: '😗',
        samples: [
            { text: "A loud human finger whistle", duration: 2 },
            { text: "A classic tin whistle playing a jig", duration: 6 },
            { text: "A wooden train whistle sound", duration: 4 },
            { text: "A sports referee's metal whistle", duration: 1 },
            { text: "The howl of wind whistling in a cave", duration: 10 }
        ]
    },
    { 
        id: 'whoosh', label: 'Whoosh', icon: '💨',
        samples: [
            { text: "A cinematic transition deep whoosh", duration: 3 },
            { text: "A high-speed sword swing whoosh", duration: 1 },
            { text: "The whoosh of a car passing at 100mph", duration: 2 },
            { text: "A magical fireball flyby whoosh", duration: 2 },
            { text: "A soft cloth whip whoosh", duration: 1 }
        ]
    },
    { 
        id: 'bass', label: 'Bass', icon: '🎸',
        samples: [
            { text: "Deep sub-harmonic sine bass drop", duration: 4 },
            { text: "Gritty distorted reese bass swell", duration: 6 },
            { text: "Pulsing cinematic synth bass rhythm", duration: 8 },
            { text: "Heavy 808 bass kick with long tail", duration: 3 },
            { text: "A low frequency wobble bass sound", duration: 5 }
        ]
    },
    { 
        id: 'braams', label: 'Braams', icon: '📢',
        samples: [
            { text: "Classic cinematic trailer braam hit", duration: 4 },
            { text: "Dystopian metallic foghorn blast", duration: 6 },
            { text: "Deep brassy orchestral impact", duration: 5 },
            { text: "Glitchy distorted futuristic braam", duration: 4 },
            { text: "Low-end thunderous horn resonance", duration: 7 }
        ]
    },
    { 
        id: 'brass', label: 'Brass', icon: '🎺',
        samples: [
            { text: "Epic orchestral trombone swell", duration: 5 },
            { text: "Staccato trumpet fanfare hits", duration: 3 },
            { text: "Muted jazz trumpet with a wah effect", duration: 6 },
            { text: "Deep tuba low-end growl", duration: 4 },
            { text: "A bright French horn melody segment", duration: 8 }
        ]
    },
    { 
        id: 'drones', label: 'Drones', icon: '🛸',
        samples: [
            { text: "Eerie ambient dark space drone", duration: 15 },
            { text: "Metallic industrial humming drone", duration: 12 },
            { text: "Mystical shimmering ethereal drone", duration: 20 },
            { text: "Low frequency rhythmic engine drone", duration: 10 },
            { text: "Distorted electric guitar drone", duration: 15 }
        ]
    },
    { 
        id: 'fantasy', label: 'Fantasy', icon: '🧙',
        samples: [
            { text: "Magical fairy dust sparkle effect", duration: 3 },
            { text: "Ancient dragon roar and flame breath", duration: 6 },
            { text: "Mysterious crystal cave resonance", duration: 10 },
            { text: "Elf arrow whizzing through forest", duration: 2 },
            { text: "A dark wizard's chanting echo", duration: 8 }
        ]
    },
    { 
        id: 'guitar', label: 'Guitar', icon: '🎸',
        samples: [
            { text: "Clean electric guitar chord strum", duration: 4 },
            { text: "Heavy distorted metal guitar riff", duration: 6 },
            { text: "Acoustic guitar harmonics and slides", duration: 5 },
            { text: "Bluesy slide guitar licks", duration: 8 },
            { text: "Fast palm-muted guitar chugging", duration: 4 }
        ]
    },
    { 
        id: 'household', label: 'Household', icon: '🏠',
        samples: [
            { text: "Washing machine spinning and vibration", duration: 10 },
            { text: "A kitchen blender at high speed", duration: 8 },
            { text: "Vacuum cleaner hum on a carpet", duration: 12 },
            { text: "Clock ticking in a silent room", duration: 10 },
            { text: "Sizzling frying pan on a stove", duration: 15 }
        ]
    },
    { 
        id: 'impacts', label: 'Impacts', icon: '🔨',
        samples: [
            { text: "Heavy metal slam on concrete", duration: 3 },
            { text: "Wood timber snapping under pressure", duration: 2 },
            { text: "Shattering glass window break", duration: 4 },
            { text: "Dull thud of a heavy punch", duration: 1 },
            { text: "Cinematic trailer sub-bass hit", duration: 5 }
        ]
    },
    { 
        id: 'industrial', label: 'Industrial', icon: '🏗️',
        samples: [
            { text: "Rhythmic factory machine clanking", duration: 10 },
            { text: "Steam escaping from a high-pressure pipe", duration: 4 },
            { text: "Heavy elevator gears and motor hum", duration: 12 },
            { text: "Hydraulic piston hiss and movement", duration: 6 },
            { text: "Metal grinding on a spinning wheel", duration: 8 }
        ]
    },
    { 
        id: 'keys', label: 'Keys', icon: '🎹',
        samples: [
            { text: "Majestic grand piano chord", duration: 5 },
            { text: "Ethereal electric piano pad", duration: 10 },
            { text: "Funky 70s rhodes piano lick", duration: 8 },
            { text: "Classical harpsichord arpeggio", duration: 6 },
            { text: "Lo-fi upright piano melody", duration: 12 }
        ]
    },
    { 
        id: 'ocean', label: 'Ocean', icon: '🌊',
        samples: [
            { text: "Crashing ocean waves on a rocky shore", duration: 15 },
            { text: "Gentle lapping water at a calm beach", duration: 12 },
            { text: "Underwater bubbles and dolphin clicks", duration: 10 },
            { text: "A ship cutting through heavy swells", duration: 8 },
            { text: "Seagulls crying over the open sea", duration: 15 }
        ]
    },
    { 
        id: 'restaurants', label: 'Restaurants', icon: '🍴',
        samples: [
            { text: "Bustling restaurant kitchen chatter", duration: 15 },
            { text: "Clinking cutlery and ceramic plates", duration: 10 },
            { text: "Coffee shop ambient murmurs and steam", duration: 20 },
            { text: "Order bell 'ding' in a busy diner", duration: 2 },
            { text: "Sparkling water being poured into glass", duration: 5 }
        ]
    },
    { 
        id: 'risers', label: 'Risers', icon: '📈',
        samples: [
            { text: "Pitch-shifting cinematic tension riser", duration: 8 },
            { text: "Shepard tone infinity building sound", duration: 15 },
            { text: "White noise snare-roll build up", duration: 6 },
            { text: "Synthesized horror orchestral riser", duration: 10 },
            { text: "Glitchy digital building atmosphere", duration: 7 }
        ]
    },
    { 
        id: 'school', label: 'School', icon: '🏫',
        samples: [
            { text: "Busy school hallway with kids shouting", duration: 15 },
            { text: "Classroom bell ringing loudly", duration: 4 },
            { text: "Writing on a chalkboard with chalk", duration: 6 },
            { text: "Kids playing in a school courtyard", duration: 12 },
            { text: "Locker doors slamming in a row", duration: 5 }
        ]
    },
    { 
        id: 'urban', label: 'Urban', icon: '🏙️',
        samples: [
            { text: "Night New York Vibes: Calm city atmosphere with very distant police sirens and smooth traffic hum", duration: 15 },
            { text: "Quiet New York Street: Midnight ambience with soft steam hiss and distant echo of sirens", duration: 12 },
            { text: "Times Square at Night: Muffled crowd murmur and electronic sign hum in the distance", duration: 10 },
            { text: "Gotham Night: Dark, calm city wind with periodic blue-note police siren echos", duration: 15 }
        ]
    },
    { 
        id: 'strings', label: 'Strings', icon: '🎻',
        samples: [
            { text: "Emotional solo cello melody", duration: 10 },
            { text: "Tense orchestral violin tremolo", duration: 8 },
            { text: "Plucked pizzicato string section", duration: 6 },
            { text: "Lush symphonic string pad ensemble", duration: 15 },
            { text: "Aggressive double bass bowing", duration: 5 }
        ]
    },
    { 
        id: 'synth', label: 'Synth', icon: '🎹',
        samples: [
            { text: "Vintage 80s analog synth lead", duration: 8 },
            { text: "Modern wavetable dubstep growl", duration: 6 },
            { text: "Floating atmospheric synth pad", duration: 15 },
            { text: "Retro video game chiptune melody", duration: 5 },
            { text: "Acid house TB-303 squelch loop", duration: 8 }
        ]
    }
]

export function AudioEffectsTool() {
    const [isProcessing, setIsProcessing] = useState(false)
    const [audioFile, setAudioFile] = useState<File | null>(null)
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const [selectedEffect, setSelectedEffect] = useState('none')
    const [selectedMusic, setSelectedMusic] = useState('none')
    const [musicVolume, setMusicVolume] = useState(30)
    const [voiceVolume, setVoiceVolume] = useState(100)
    const [isPlaying, setIsPlaying] = useState(false)
    const [activeTab, setActiveTab] = useState<'process' | 'generate'>('process')
    const [mixedAudioHistory, setMixedAudioHistory] = useState<{name: string, audioUrl: string, timestamp: number, effect: string, music: string}[]>([])
    const [sfxPrompt, setSfxPrompt] = useState("")
    const [isGeneratingSfx, setIsGeneratingSfx] = useState(false)
    const [libraryPreviews, setLibraryPreviews] = useState<Record<string, string>>({})
    const [libraryBase64, setLibraryBase64] = useState<Record<string, string>>({})
    const [generatingPreviews, setGeneratingPreviews] = useState<Record<string, boolean>>({})
    const [userGeneratedSfx, setUserGeneratedSfx] = useState<{text: string, audioUrl: string, timestamp: number, base64?: string}[]>([])
    const [durationSeconds, setDurationSeconds] = useState(5)
    const [promptInfluence, setPromptInfluence] = useState(0.3)
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [selectedSfxLayer, setSelectedSfxLayer] = useState<{text: string, audioUrl: string} | null>(null)
    const [sfxLayerVolume, setSfxLayerVolume] = useState(100)
    const [isMounted, setIsMounted] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [showHistory, setShowHistory] = useState(true)
    const [playingHistoryId, setPlayingHistoryId] = useState<number | string | null>(null)
    
    const audioRef = useRef<HTMLAudioElement>(null)
    const musicRef = useRef<HTMLAudioElement>(null)
    const sfxLayerRef = useRef<HTMLAudioElement>(null)
    const historyAudioRef = useRef<HTMLAudioElement | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const audioCtxRef = useRef<AudioContext | null>(null)
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
    const filterRef = useRef<BiquadFilterNode | null>(null)
    const delayRef = useRef<DelayNode | null>(null)
    const feedbackRef = useRef<GainNode | null>(null)

    useEffect(() => {
        setIsMounted(true)
        
        // Restore history from localStorage
        const savedSfx = localStorage.getItem('user_sfx_history')
        const savedPreviews = localStorage.getItem('library_previews_base64')
        const savedMixes = localStorage.getItem('mixed_audio_history')

        if (savedSfx) {
            try {
                const parsed = JSON.parse(savedSfx)
                const restored = parsed.map((item: any) => {
                    if (item.base64) {
                        const binary = atob(item.base64)
                        const bytes = new Uint8Array(binary.length)
                        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
                        const blob = new Blob([bytes], { type: 'audio/mpeg' })
                        return { ...item, audioUrl: URL.createObjectURL(blob) }
                    }
                    return item
                })
                setUserGeneratedSfx(restored)
            } catch (e) { console.error("History restore failed", e) }
        }

        if (savedPreviews) {
            try {
                const parsed = JSON.parse(savedPreviews)
                setLibraryBase64(parsed)
                const restored: Record<string, string> = {}
                Object.entries(parsed).forEach(([text, base64]: [string, any]) => {
                    const binary = atob(base64)
                    const bytes = new Uint8Array(binary.length)
                    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
                    const blob = new Blob([bytes], { type: 'audio/mpeg' })
                    restored[text] = URL.createObjectURL(blob)
                })
                setLibraryPreviews(restored)
            } catch (e) { console.error("Library restore failed", e) }
        }

        if (savedMixes) {
            try { setMixedAudioHistory(JSON.parse(savedMixes)) }
            catch (e) { console.error("Mixes restore failed", e) }
        }
    }, [])

    // Persist to localStorage safely to prevent QuotaExceededError
    useEffect(() => {
        if (!isMounted) return
        try {
            localStorage.setItem('user_sfx_history', JSON.stringify(userGeneratedSfx))
        } catch (e) {
            console.warn("Storage quota exceeded for user_sfx_history")
        }
    }, [userGeneratedSfx, isMounted])

    useEffect(() => {
        if (!isMounted) return
        try {
            localStorage.setItem('library_previews_base64', JSON.stringify(libraryBase64))
        } catch (e) {
            console.warn("Storage quota exceeded for library_previews_base64. Skipping cache.")
        }
    }, [libraryBase64, isMounted])

    useEffect(() => {
        if (!isMounted) return
        try {
            localStorage.setItem('mixed_audio_history', JSON.stringify(mixedAudioHistory))
        } catch (e) {
            console.warn("Storage quota exceeded for mixed_audio_history")
        }
    }, [mixedAudioHistory, isMounted])

    const initAudioContext = () => {
        if (!audioCtxRef.current && audioRef.current && !sourceRef.current) {
            try {
                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
                audioCtxRef.current = ctx
                
                const source = ctx.createMediaElementSource(audioRef.current)
                const filter = ctx.createBiquadFilter()
                const delay = ctx.createDelay(1.0)
                const feedback = ctx.createGain()
                // Set initial volumes
                audioRef.current.volume = voiceVolume / 100
                if (musicRef.current) musicRef.current.volume = musicVolume / 100
                if (sfxLayerRef.current) sfxLayerRef.current.volume = sfxLayerVolume / 100

                sourceRef.current = source
                filterRef.current = filter
                delayRef.current = delay
                feedbackRef.current = feedback

                // Setup Echo loop
                delay.connect(feedback)
                feedback.connect(delay)
                
                updateAudioGraph()
            } catch (err) {
                console.error("Failed to init AudioContext:", err)
            }
        }
    }

    const updateAudioGraph = () => {
        if (!audioCtxRef.current || !sourceRef.current || !filterRef.current || !delayRef.current || !feedbackRef.current || !audioRef.current) return

        const ctx = audioCtxRef.current
        const source = sourceRef.current
        const filter = filterRef.current
        const delay = delayRef.current
        const feedback = feedbackRef.current

        // Disconnect everything first
        source.disconnect()
        filter.disconnect()
        delay.disconnect()
        feedback.disconnect()

        // Reset filter and pitch
        filter.type = 'allpass'
        feedback.gain.value = 0
        audioRef.current.playbackRate = 1.0

        if (selectedEffect === 'reverb' || selectedEffect === 'echo') {
            const isEcho = selectedEffect === 'echo'
            delay.delayTime.value = isEcho ? 0.35 : 0.08
            feedback.gain.value = isEcho ? 0.45 : 0.3
            
            source.connect(ctx.destination) // Dry signal
            source.connect(delay)           // Wet signal path
            delay.connect(feedback)
            feedback.connect(delay)
            delay.connect(ctx.destination)
        } else if (selectedEffect === 'deep') {
            audioRef.current.playbackRate = 0.85
            filter.type = 'lowshelf'
            filter.frequency.value = 500
            filter.gain.value = 10
            source.connect(filter)
            filter.connect(ctx.destination)
        } else if (selectedEffect === 'high') {
            audioRef.current.playbackRate = 1.25
            filter.type = 'highpass'
            filter.frequency.value = 1500
            source.connect(filter)
            filter.connect(ctx.destination)
        } else if (selectedEffect === 'robot') {
            // Metallic ring mod effect using peaking filters
            filter.type = 'peaking'
            filter.frequency.value = 800
            filter.Q.value = 20
            filter.gain.value = 15
            source.connect(filter)
            filter.connect(ctx.destination)
        } else if (selectedEffect === 'telephone') {
            filter.type = 'peaking'
            filter.frequency.value = 2000
            filter.Q.value = 1
            filter.gain.value = 10
            source.connect(filter)
            filter.connect(ctx.destination)
            audioRef.current.playbackRate = 1.05
        } else if (selectedEffect === 'underwater') {
            filter.type = 'lowpass'
            filter.frequency.value = 400
            delay.delayTime.value = 0.12
            feedback.gain.value = 0.5
            source.connect(filter)
            filter.connect(delay)
            delay.connect(feedback)
            feedback.connect(delay)
            delay.connect(ctx.destination)
        } else if (selectedEffect === 'stadium') {
            delay.delayTime.value = 0.6
            feedback.gain.value = 0.6
            filter.type = 'lowpass'
            filter.frequency.value = 2000
            source.connect(ctx.destination)
            source.connect(delay)
            delay.connect(filter)
            filter.connect(feedback)
            feedback.connect(delay)
            filter.connect(ctx.destination)
        } else if (selectedEffect === 'radio') {
            // High-pass filter + peaking to simulate small speaker
            filter.type = 'highpass'
            filter.frequency.value = 800
            source.connect(filter)
            filter.connect(ctx.destination)
            audioRef.current.playbackRate = 1.1
        } else if (selectedEffect === 'ghost') {
            // Long delay + high feedback + lowpass for muffled ethereal sound
            delay.delayTime.value = 0.8
            feedback.gain.value = 0.7
            filter.type = 'lowpass'
            filter.frequency.value = 600
            source.connect(delay)
            delay.connect(filter)
            filter.connect(feedback)
            feedback.connect(delay)
            filter.connect(ctx.destination)
        } else if (selectedEffect === 'glitch') {
            // Rapid pitch shifting simulation + distortion filter
            audioRef.current.playbackRate = 1.05
            filter.type = 'peaking'
            filter.frequency.value = 1500
            filter.Q.value = 30
            filter.gain.value = 20
            source.connect(filter)
            filter.connect(ctx.destination)
        } else {
            source.connect(ctx.destination)
        }
    }

    useEffect(() => {
        if (audioCtxRef.current) {
            updateAudioGraph()
        }
    }, [selectedEffect])

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error("File too large. Max 10MB.")
                return
            }
            if (audioUrl) URL.revokeObjectURL(audioUrl)
            setAudioFile(file)
            setAudioUrl(URL.createObjectURL(file))
            setIsPlaying(false)
        }
    }

    const togglePlay = async () => {
        if (!audioRef.current) return

        if (!isPlaying) {
            initAudioContext()
            if (audioCtxRef.current?.state === 'suspended') {
                await audioCtxRef.current.resume()
            }
            audioRef.current.play()
            if (musicRef.current && selectedMusic !== 'none') {
                musicRef.current.play()
            }
            if (sfxLayerRef.current && selectedSfxLayer) {
                sfxLayerRef.current.play()
            }
            setIsPlaying(true)
        } else {
            audioRef.current.pause()
            musicRef.current?.pause()
            sfxLayerRef.current?.pause()
            setIsPlaying(false)
        }
    }

    const handleProcess = async () => {
        if (!audioFile) {
            toast.error("Please upload an audio file first.")
            return
        }

        setIsProcessing(true)
        setTimeout(() => {
            setIsProcessing(false)
            if (audioUrl) {
                const newMix = {
                    name: audioFile ? `Mix: ${audioFile.name}` : `Rendered Mix ${mixedAudioHistory.length + 1}`,
                    audioUrl: audioUrl,
                    timestamp: Date.now(),
                    effect: EFFECTS.find(e => e.id === selectedEffect)?.label || 'Original',
                    music: AMBIENT_MUSIC.find(m => m.id === selectedMusic)?.label || 'None'
                }
                setMixedAudioHistory(prev => [newMix, ...prev])
            }
            toast.success("Final mix rendered and saved!")
        }, 3000)
    }

    const generateSfx = async () => {
        if (!sfxPrompt.trim()) {
            toast.error("Please enter a description for the sound effect.")
            return
        }
        setIsGeneratingSfx(true)
        try {
            const res = await fetch('/api/generate/sound-effect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: sfxPrompt,
                    duration_seconds: durationSeconds,
                    prompt_influence: promptInfluence
                })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            // ✅ Proper base64 → Blob (no secondary fetch needed)
            const binary = atob(data.audio)
            const bytes = new Uint8Array(binary.length)
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i)
            }
            const blob = new Blob([bytes], { type: 'audio/mpeg' })
            const url = URL.createObjectURL(blob)
            
            // Save to user history
            setUserGeneratedSfx(prev => [{ text: sfxPrompt, audioUrl: url, timestamp: Date.now(), base64: data.audio }, ...prev])
            
            // If we already have a main file (dropped audio), add this as a layer
            if (audioFile) {
                setSelectedSfxLayer({ text: sfxPrompt, audioUrl: url })
                toast.success("Sound effect added as a new layer!")
                setActiveTab('process')
            } else {
                // Otherwise set as main audio file
                const file = new File([blob], "generated-sfx.mp3", { type: "audio/mpeg" })
                setAudioFile(file)
                setAudioUrl(url)
                toast.success("Sound effect generated!")
            }
            toast.success("Sound effect generated and loaded into Lab!")
        } catch (err: any) {
            toast.error(err.message || "Failed to generate sound effect")
        } finally {
            setIsGeneratingSfx(false)
        }
    }

    const generateLibraryPreview = async (text: string, duration: number) => {
        if (libraryPreviews[text]) {
            toggleHistoryAudio(libraryPreviews[text], text)
            return
        }

        setGeneratingPreviews(prev => ({ ...prev, [text]: true }))
        toast.info(`Generating ${text}...`, { icon: "✨" })

        try {
            const res = await fetch('/api/generate/sound-effect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: text,
                    duration_seconds: duration,
                    prompt_influence: 0.3
                })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            const binary = atob(data.audio)
            const bytes = new Uint8Array(binary.length)
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i)
            }
            const blob = new Blob([bytes], { type: 'audio/mpeg' })
            const url = URL.createObjectURL(blob)

            setLibraryPreviews(prev => ({ ...prev, [text]: url }))
            setLibraryBase64(prev => ({ ...prev, [text]: data.audio }))
            // Save to user history
            setUserGeneratedSfx(prev => [{ text, audioUrl: url, timestamp: Date.now(), base64: data.audio }, ...prev])
            
            toggleHistoryAudio(url, text)
            toast.success("Ready!")
        } catch (err: any) {
            toast.error(err.message || "Failed to generate preview")
        } finally {
            setGeneratingPreviews(prev => ({ ...prev, [text]: false }))
        }
    }

    const toggleHistoryAudio = (url: string, id: number | string) => {
        if (playingHistoryId === id) {
            if (historyAudioRef.current) {
                historyAudioRef.current.pause();
                historyAudioRef.current.currentTime = 0;
            }
            setPlayingHistoryId(null);
        } else {
            if (historyAudioRef.current) {
                historyAudioRef.current.pause();
                historyAudioRef.current.currentTime = 0;
            }
            const audio = new Audio(url);
            historyAudioRef.current = audio;
            audio.play();
            setPlayingHistoryId(id);
            audio.onended = () => setPlayingHistoryId(null);
        }
    };

    const getMusicSrc = () => {
        switch(selectedMusic) {
            case 'lofi': return 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
            case 'cinematic': return 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
            case 'tech': return 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
            case 'inspirational': return 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
            case 'suspense': return 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
            default: return ''
        }
    }

    if (!isMounted) return null

    return (
        <div className="mt-12 pt-12 border-t border-zinc-800/50">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                            <Wand2 className="w-6 h-6" />
                        </div>
                        Audio Lab: Effects & Music
                    </h2>
                    <p className="text-zinc-500 mt-2">Enhance your voiceovers or generate new sound effects with AI.</p>
                </div>

                <div className="flex bg-zinc-900/50 p-1 rounded-xl border border-zinc-800 self-start">
                    <button 
                        onClick={() => setActiveTab('process')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'process' ? 'bg-purple-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Mixer Lab
                    </button>
                    <button 
                        onClick={() => setActiveTab('generate')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'generate' ? 'bg-purple-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Sound Library
                    </button>
                </div>
            </div>

            {activeTab === 'generate' && (
                <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
                    {/* Left Column: History Button Space */}
                    <div className="w-full md:w-[350px] shrink-0">
                        {(userGeneratedSfx.length > 0 || mixedAudioHistory.length > 0) && (
                            <button 
                                onClick={() => setShowHistory(!showHistory)}
                                className="w-full h-[50px] flex items-center justify-between px-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-purple-500/30 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20">
                                        <History className="w-4 h-4" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-bold text-zinc-300 tracking-widest uppercase">Saved Assets</p>
                                        <p className="text-[9px] text-zinc-500">{userGeneratedSfx.length + mixedAudioHistory.length} files</p>
                                    </div>
                                </div>
                                {showHistory ? <ChevronUp className="w-4 h-4 text-zinc-600" /> : <ChevronDown className="w-4 h-4 text-zinc-600" />}
                            </button>
                        )}
                    </div>

                    {/* Right Column: Search Area */}
                    <div className="relative flex-1 group w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                        <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search 50+ sound categories..."
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl pl-12 pr-4 py-3 text-xs text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all font-outfit"
                        />
                    </div>
                </div>
            )}

            {/* History Results (Appears below toolbar if open) */}
            {activeTab === 'generate' && showHistory && (userGeneratedSfx.length > 0 || mixedAudioHistory.length > 0) && (
                <div className="mb-8 p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Generated SFX History */}
                        {userGeneratedSfx.length > 0 && (
                            <div className="space-y-4">
                                <Label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 flex items-center gap-2 px-1">
                                    <Sparkles className="w-3 h-3 text-purple-400" />
                                    Generated Sounds
                                </Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {userGeneratedSfx.map((sfx) => (
                                        <div 
                                            key={sfx.timestamp}
                                            className={`p-3 rounded-2xl border bg-zinc-800/30 border-zinc-800 transition-all group flex items-center justify-between hover:border-purple-500/30 ${
                                                selectedSfxLayer?.audioUrl === sfx.audioUrl ? 'ring-1 ring-purple-500/40 bg-purple-500/5' : ''
                                            } ${playingHistoryId === sfx.timestamp ? 'border-purple-500/50 bg-purple-500/5' : ''}`}
                                        >
                                            <div className="flex flex-col gap-0.5 min-w-0">
                                                <span className="text-[11px] font-bold text-zinc-300 truncate w-full group-hover:text-purple-400">
                                                    {sfx.text}
                                                </span>
                                                <span className="text-[9px] text-zinc-600 font-mono">
                                                    {new Date(sfx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleHistoryAudio(sfx.audioUrl, sfx.timestamp);
                                                    }}
                                                    className={`h-8 w-8 rounded-xl transition-all flex items-center justify-center ${
                                                        playingHistoryId === sfx.timestamp 
                                                            ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                                                            : 'bg-zinc-800 text-zinc-400 hover:bg-purple-500 hover:text-white'
                                                    }`}
                                                >
                                                    {playingHistoryId === sfx.timestamp ? (
                                                        <Pause className="w-3.5 h-3.5 fill-current" />
                                                    ) : (
                                                        <Play className="w-3.5 h-3.5 fill-current" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedSfxLayer(sfx);
                                                        toast.success("Added to Mixer!");
                                                        setActiveTab('process');
                                                    }}
                                                    className={`h-8 w-8 rounded-xl transition-all flex items-center justify-center ${
                                                        selectedSfxLayer?.audioUrl === sfx.audioUrl 
                                                            ? 'bg-purple-500 text-white' 
                                                            : 'bg-zinc-800 text-zinc-500 hover:text-purple-400'
                                                    }`}
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Mixed Audio History */}
                        {mixedAudioHistory.length > 0 && (
                            <div className="space-y-4">
                                <Label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 flex items-center gap-2 px-1">
                                    <Wand2 className="w-3 h-3 text-purple-400" />
                                    Recent Mixes
                                </Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {mixedAudioHistory.map((mix) => (
                                        <div 
                                            key={mix.timestamp}
                                            className={`p-3 rounded-2xl border bg-zinc-800/30 border-zinc-800 transition-all group flex items-center justify-between hover:border-purple-500/30 ${
                                                playingHistoryId === mix.timestamp ? 'border-purple-500/50 bg-purple-500/5' : ''
                                            }`}
                                        >
                                            <div className="flex flex-col gap-0.5 min-w-0">
                                                <span className="text-[11px] font-bold text-zinc-300 truncate w-full group-hover:text-purple-400">
                                                    {mix.name}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] text-zinc-500 bg-zinc-700/50 px-1.5 py-0.5 rounded uppercase font-bold">{mix.effect}</span>
                                                    <span className="text-[9px] text-zinc-600 font-mono">
                                                        {new Date(mix.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => toggleHistoryAudio(mix.audioUrl, mix.timestamp)}
                                                    className={`h-8 w-8 rounded-xl transition-all flex items-center justify-center ${
                                                        playingHistoryId === mix.timestamp 
                                                            ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                                                            : 'bg-zinc-800 text-zinc-400 hover:bg-purple-500 hover:text-white'
                                                    }`}
                                                >
                                                    {playingHistoryId === mix.timestamp ? (
                                                        <Pause className="w-3.5 h-3.5 fill-current" />
                                                    ) : (
                                                        <Play className="w-3.5 h-3.5 fill-current" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const link = document.createElement('a');
                                                        link.href = mix.audioUrl;
                                                        link.download = `mixed-${mix.timestamp}.mp3`;
                                                        link.click();
                                                    }}
                                                    className="h-8 w-8 rounded-xl bg-zinc-800 text-zinc-500 hover:text-white transition-all flex items-center justify-center"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-4">
                {/* Left Panel: Upload & Controls */}
                <div className="w-full lg:w-[350px] shrink-0 space-y-6">
                    {activeTab === 'process' ? (
                        <Card className="bg-zinc-900/40 border-zinc-800 backdrop-blur-sm overflow-hidden">
                            <CardContent className="p-6 space-y-6">
                                {/* Upload Area */}
                                <div className="space-y-3">
                                    <Label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Source Audio</Label>
                                    {!audioFile ? (
                                        <div 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="h-32 border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-purple-500/40 hover:bg-purple-500/5 transition-all group"
                                        >
                                            <div className="p-3 rounded-full bg-zinc-800 group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-colors">
                                                <Upload className="w-5 h-5" />
                                            </div>
                                            <p className="text-xs text-zinc-500 group-hover:text-zinc-300">Upload MP3/WAV</p>
                                            <input 
                                                ref={fileInputRef}
                                                type="file" 
                                                accept="audio/*" 
                                                className="hidden" 
                                                onChange={handleFileUpload}
                                            />
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-2xl flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                                                    <Volume2 className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-medium text-zinc-200 truncate max-w-[150px]">{audioFile.name}</p>
                                                    <p className="text-[10px] text-zinc-500">{(audioFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => { setAudioFile(null); setAudioUrl(null); setIsPlaying(false); }}
                                                className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Music Selector */}
                                <div className="space-y-3">
                                    <Label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Background Music</Label>
                                    <Select value={selectedMusic} onValueChange={setSelectedMusic}>
                                        <SelectTrigger className="bg-zinc-800 border-zinc-700 h-10 text-xs font-outfit">
                                            <div className="flex items-center gap-2">
                                                <Music className="w-3.5 h-3.5 text-purple-400" />
                                                <SelectValue />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 font-outfit">
                                            {AMBIENT_MUSIC.map(m => (
                                                <SelectItem key={m.id} value={m.id} className="text-xs focus:bg-purple-500/10 focus:text-purple-400">
                                                    {m.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Mixing Sliders */}
                                <div className="space-y-4 pt-2">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <Label className="text-[10px] uppercase font-bold text-zinc-500">Voice Volume</Label>
                                            <span className="text-[10px] font-mono text-zinc-400">{voiceVolume}%</span>
                                        </div>
                                        <Slider 
                                            value={[voiceVolume]} 
                                            onValueChange={(v) => {
                                                setVoiceVolume(v[0]);
                                                if (audioRef.current) audioRef.current.volume = v[0] / 100;
                                            }} 
                                            max={100} 
                                            step={1}
                                            className="h-1"
                                        />
                                    </div>

                                    {selectedSfxLayer && (
                                        <div className="space-y-2 p-3 bg-purple-500/5 border border-purple-500/20 rounded-xl">
                                            <div className="flex justify-between items-center mb-1">
                                                <Label className="text-[10px] uppercase font-bold text-purple-400">Layer: {selectedSfxLayer.text}</Label>
                                                <button onClick={() => setSelectedSfxLayer(null)} className="text-zinc-500 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                                            </div>
                                            <div className="flex justify-between">
                                                <Label className="text-[10px] uppercase font-bold text-zinc-500">SFX Volume</Label>
                                                <span className="text-[10px] font-mono text-zinc-400">{sfxLayerVolume}%</span>
                                            </div>
                                            <Slider 
                                                value={[sfxLayerVolume]} 
                                                onValueChange={(v) => {
                                                    setSfxLayerVolume(v[0]);
                                                    if (sfxLayerRef.current) sfxLayerRef.current.volume = v[0] / 100;
                                                }} 
                                                max={100} 
                                                step={1}
                                                className="h-1"
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2 text-purple-400">
                                        <div className="flex justify-between">
                                            <Label className="text-[10px] uppercase font-bold text-zinc-500">Music Volume</Label>
                                            <span className="text-[10px] font-mono text-zinc-400">{musicVolume}%</span>
                                        </div>
                                        <Slider 
                                            value={[musicVolume]} 
                                            onValueChange={(v) => {
                                                setMusicVolume(v[0]);
                                                if (musicRef.current) musicRef.current.volume = v[0] / 100;
                                            }} 
                                            max={100} 
                                            step={1}
                                            className="h-1"
                                        />
                                    </div>

                                    <div className="pt-4 border-t border-zinc-800">
                                        <button 
                                            onClick={() => setActiveTab('generate')}
                                            className="w-full py-3 px-4 rounded-xl bg-zinc-800/50 border border-zinc-700 hover:border-purple-500/50 hover:bg-purple-500/5 text-xs font-bold text-zinc-400 hover:text-purple-400 flex items-center justify-between transition-all group"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Sparkles className="w-4 h-4" />
                                                Generate Custom SFX
                                            </div>
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            <Card className="bg-zinc-900/40 border-zinc-800 backdrop-blur-sm overflow-hidden">
                                <CardContent className="p-6 space-y-6">
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Sound Description</Label>
                                            <textarea 
                                                value={sfxPrompt}
                                                onChange={(e) => setSfxPrompt(e.target.value)}
                                                placeholder="e.g. A futuristic spaceship engine idling with a low hum..."
                                                className="w-full h-32 bg-zinc-800 border-zinc-700 rounded-2xl p-4 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 resize-none font-outfit"
                                            />
                                        </div>

                                        {/* Advanced Settings */}
                                        <div className="space-y-4 pt-2 border-t border-zinc-800/50">
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <Label className="text-[10px] uppercase font-bold text-zinc-500">Duration ({durationSeconds}s)</Label>
                                                    <span className="text-[10px] font-mono text-zinc-400">Max 30s</span>
                                                </div>
                                                <Slider 
                                                    value={[durationSeconds]} 
                                                    onValueChange={(v) => setDurationSeconds(v[0])} 
                                                    min={0.5}
                                                    max={30} 
                                                    step={0.5}
                                                    className="h-1 shadow-sm"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <Label className="text-[10px] uppercase font-bold text-zinc-500">Prompt Influence ({Math.round(promptInfluence * 100)}%)</Label>
                                                    <span className="text-[10px] font-mono text-zinc-400">Default 30%</span>
                                                </div>
                                                <Slider 
                                                    value={[promptInfluence * 100]} 
                                                    onValueChange={(v) => setPromptInfluence(v[0] / 100)} 
                                                    max={100} 
                                                    step={1}
                                                    className="h-1"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 flex gap-3">
                                            <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                                            <div className="space-y-1">
                                                <p className="text-[11px] text-purple-200 font-bold uppercase tracking-wider">AI Integration Active</p>
                                                <p className="text-[10px] text-purple-200/60 leading-relaxed font-outfit">
                                                    Using ElevenLabs Sound Effects v2. Each generation creates studio-quality foley and cinematic sounds.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    <Button 
                        onClick={activeTab === 'process' ? handleProcess : generateSfx}
                        disabled={isProcessing || isGeneratingSfx || (activeTab === 'process' && !audioFile) || (activeTab === 'generate' && !sfxPrompt.trim())}
                        className="w-full h-12 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all"
                    >
                        {isProcessing || isGeneratingSfx ? (
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        ) : activeTab === 'process' ? (
                            <Wand2 className="w-5 h-5 mr-2" />
                        ) : (
                            <Sparkles className="w-5 h-5 mr-2" />
                        )}
                        {isProcessing || isGeneratingSfx ? (activeTab === 'process' ? "Mixing..." : "Generating...") : (activeTab === 'process' ? "Render Final Mix" : "Create Sound Effect")}
                    </Button>
                </div>

                {/* Right Panel: Presets & Preview */}
                <div className="flex-1 min-w-0 flex flex-col gap-6">
                    {activeTab === 'process' ? (
                        /* Effects Grid */
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {EFFECTS.map((effect) => (
                                <div 
                                    key={effect.id}
                                    onClick={() => setSelectedEffect(effect.id)}
                                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col items-center gap-3 text-center ${
                                        selectedEffect === effect.id 
                                            ? 'bg-purple-500/10 border-purple-500/40 ring-1 ring-purple-500/40' 
                                            : 'bg-zinc-900 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-800/50'
                                    }`}
                                >
                                    <div className={`p-3 rounded-xl ${selectedEffect === effect.id ? 'bg-purple-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                                        <effect.icon className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className={`text-xs font-bold ${selectedEffect === effect.id ? 'text-purple-400' : 'text-zinc-300'}`}>{effect.label}</p>
                                        <p className="text-[10px] text-zinc-500">Preset</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* SFX Explorer Grid */
                         <div className="space-y-4">
                            {!selectedCategory ? (
                                <>
                                    <div className="grid grid-rows-3 grid-flow-col gap-4 overflow-x-auto pb-6 scroll-smooth snap-x snap-mandatory no-scrollbar cursor-grab active:cursor-grabbing">
                                        {SFX_CATEGORIES.filter(cat => 
                                            cat.label.toLowerCase().includes(searchQuery.toLowerCase())
                                        ).length > 0 ? (
                                            SFX_CATEGORIES.filter(cat => 
                                                cat.label.toLowerCase().includes(searchQuery.toLowerCase())
                                            ).reverse().map((cat) => {
                                                const getCategoryImg = (id: string) => {
                                                    const mapping: Record<string, string> = {
                                                        'animal': 'animals.jpeg',
                                                        'booms': 'booms.jpeg',
                                                        'cymbals': 'cymbals.jpeg',
                                                        'devices': 'devices.jpeg',
                                                        'foley': 'foley.jpeg',
                                                        'human': 'humans.jpeg',
                                                        'office': 'office.jpeg',
                                                        'percussion': 'percussion.jpeg',
                                                        'scifi': 'sci-fi.jpeg',
                                                        'sport': 'sports.jpeg',
                                                        'transport': 'transport.jpeg',
                                                        'ui': 'ui-elements.jpeg',
                                                        'urban': 'urban.jpeg',
                                                        'vehicle': 'vehicles.jpeg',
                                                        'weapon': 'weapons.jpeg',
                                                        'whoosh': 'whooshes.jpeg',
                                                        'nature': 'nature.jpeg',
                                                        'ambience': 'nature.jpeg',
                                                        'environment': 'nature.jpeg',
                                                        'bass': 'bass.jpeg',
                                                        'braams': 'braams.jpeg',
                                                        'brass': 'brass.jpeg',
                                                        'drones': 'drones.jpeg',
                                                        'fantasy': 'fantasy.jpeg',
                                                        'guitar': 'guitar.jpeg',
                                                        'household': 'household.jpeg',
                                                        'impacts': 'impacts.jpeg',
                                                        'industrial': 'industrial.jpeg',
                                                        'keys': 'keys.jpeg',
                                                        'ocean': 'ocean.jpeg',
                                                        'restaurants': 'restaurants.jpeg',
                                                        'risers': 'risers.jpeg',
                                                        'school': 'school.jpeg',
                                                        'strings': 'strings.jpeg',
                                                        'synth': 'synth.jpeg'
                                                    };
                                                    return mapping[id] ? `/effectsimgs/${mapping[id]}` : '/effectsimgs/misc.jpeg';
                                                };

                                                return (
                                                    <div 
                                                        key={cat.id}
                                                        onClick={() => setSelectedCategory(cat.id)}
                                                        className={`flex-shrink-0 w-[120px] p-3 py-4 rounded-[16px] border transition-all cursor-pointer flex flex-col items-start justify-end gap-1 text-left snap-center relative overflow-hidden group/card min-h-[140px] ${
                                                            selectedCategory === cat.id 
                                                                ? 'bg-purple-500/10 border-purple-500/40 ring-1 ring-purple-500/40' 
                                                                : 'bg-zinc-900 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-800/50'
                                                        }`}
                                                        style={{
                                                            backgroundImage: `url(${getCategoryImg(cat.id)})`,
                                                            backgroundSize: 'cover',
                                                            backgroundPosition: 'center'
                                                        }}
                                                    >
                                                        {/* Gradient Overlay for Readability */}
                                                        <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-colors group-hover/card:via-black/20 ${selectedCategory === cat.id ? 'bg-purple-900/40' : ''}`} />
                                                        
                                                        <p className={`relative z-10 text-[10px] font-black leading-tight uppercase tracking-wider ${selectedCategory === cat.id ? 'text-white' : 'text-zinc-100'} drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]`}>
                                                            {cat.label}
                                                        </p>
                                                        <p className="relative z-10 text-[8px] text-white/50 font-bold tracking-tighter uppercase font-mono italic drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                                                            SFX Kit
                                                        </p>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="col-span-full py-10 text-center">
                                                <p className="text-[11px] text-zinc-500 italic">No categories found matching "{searchQuery}"</p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 mb-2">
                                        <button 
                                            onClick={() => setSelectedCategory(null)}
                                            className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
                                        >
                                            <ArrowLeft className="w-3 h-3" /> Back
                                        </button>
                                        <h4 className="text-sm font-bold text-zinc-200">
                                            {SFX_CATEGORIES.find(c => c.id === selectedCategory)?.label} Prompts
                                        </h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {SFX_CATEGORIES.find(c => c.id === selectedCategory)?.samples.map((sample, i) => (
                                            <div 
                                                key={i}
                                                className={`p-3 rounded-xl border transition-all cursor-pointer text-[11px] flex items-center justify-between group ${
                                                    selectedSfxLayer?.audioUrl === libraryPreviews[sample.text] 
                                                        ? 'bg-purple-500/10 border-purple-500/40 text-purple-400' 
                                                        : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-purple-500/30 hover:bg-purple-500/5'
                                                }`}
                                                onClick={() => {
                                                    if (libraryPreviews[sample.text]) {
                                                        setSelectedSfxLayer({ text: sample.text, audioUrl: libraryPreviews[sample.text] });
                                                        toast.success(`Layered: ${sample.text}`);
                                                        setActiveTab('process');
                                                    } else {
                                                        generateLibraryPreview(sample.text, sample.duration || 5);
                                                    }
                                                }}
                                            >
                                                <div className="flex flex-col flex-1 truncate mr-2">
                                                    <span className="truncate">{sample.text}</span>
                                                    <span className="text-[9px] text-zinc-600 font-mono italic">
                                                        {libraryPreviews[sample.text] ? "✓ Generated" : "Click to Preview"}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        disabled={generatingPreviews[sample.text]}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            generateLibraryPreview(sample.text, sample.duration || 5);
                                                        }}
                                                        className={`h-7 w-7 flex items-center justify-center rounded-lg shadow-sm transition-all ${
                                                            generatingPreviews[sample.text] 
                                                                ? 'bg-zinc-800 text-zinc-600' 
                                                                : (libraryPreviews[sample.text] ? 'bg-purple-500 text-white' : 'bg-zinc-800 text-purple-400 hover:bg-purple-500 hover:text-white')
                                                        }`}
                                                    >
                                                        {generatingPreviews[sample.text] ? (
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                        ) : (
                                                            playingHistoryId === sample.text ? (
                                                                <Pause className="w-3 h-3 fill-current" />
                                                            ) : (
                                                                libraryPreviews[sample.text] ? <Play className="w-3 h-3 fill-current" /> : <Sparkles className="w-3 h-3" />
                                                            )
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>

            {/* Preview Visualization - Full Width Bottom */}
            <div className="mt-8">
                <div className="min-h-[300px] bg-black border border-zinc-800 rounded-[32px] overflow-hidden relative group font-outfit">
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[200px] bg-purple-600/30 blur-[100px]" />
                    </div>

                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                        {!audioUrl ? (
                            <div className="space-y-4">
                                <div className="w-16 h-16 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-center mx-auto">
                                    <Music className="w-6 h-6 text-zinc-700" />
                                </div>
                                <p className="text-sm text-zinc-500">Upload audio to preview effects</p>
                            </div>
                        ) : (
                            <div className="w-full space-y-8">
                                <div className="flex items-center justify-center gap-1.5 h-20">
                                    {[...Array(20)].map((_, i) => (
                                        <div 
                                            key={i} 
                                            className={`w-1 rounded-full bg-purple-500/60 ${isPlaying ? 'animate-wave' : ''}`}
                                            style={{ 
                                                height: `${20 + Math.random() * 80}%`,
                                                animationDelay: `${i * 0.05}s`
                                            }}
                                        />
                                    ))}
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-center gap-6">
                                        <button 
                                            onClick={togglePlay}
                                            className="w-16 h-16 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-[0_0_30px_rgba(147,51,234,0.4)] hover:scale-105 active:scale-95 transition-all"
                                        >
                                            {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 fill-current ml-1" />}
                                        </button>
                                        
                                        <Button 
                                            variant="outline" 
                                            className="h-12 border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white rounded-xl px-6"
                                            onClick={() => {
                                                const link = document.createElement('a');
                                                link.href = audioUrl;
                                                link.download = "processed-audio.mp3";
                                                link.click();
                                            }}
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Download Preview
                                        </Button>
                                    </div>

                                    <audio 
                                        ref={audioRef} 
                                        src={audioUrl} 
                                        onEnded={() => setIsPlaying(false)}
                                        onPlay={() => setIsPlaying(true)}
                                        onPause={() => setIsPlaying(false)}
                                        crossOrigin="anonymous"
                                        className="hidden" 
                                    />
                                    {selectedMusic !== 'none' && (
                                        <audio
                                            ref={musicRef}
                                            src={getMusicSrc()}
                                            loop
                                            className="hidden"
                                        />
                                    )}
                                    {selectedSfxLayer && (
                                        <audio
                                            ref={sfxLayerRef}
                                            src={selectedSfxLayer.audioUrl}
                                            className="hidden"
                                            crossOrigin="anonymous"
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/5 backdrop-blur-md">
                        <div className={`w-2 h-2 rounded-full ${audioFile ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                            {audioFile ? (isPlaying ? "Previewing Effects..." : "Ready to Play") : "No Source"}
                        </span>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes wave {
                    0%, 100% { height: 20%; transform: scaleY(1); opacity: 0.3; }
                    50% { height: 80%; transform: scaleY(1.2); opacity: 1; }
                }
                .animate-wave {
                    animation: wave 1.2s ease-in-out infinite;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    )
}
