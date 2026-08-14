import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../theme/theme';

import HomeScreen from '../screens/HomeScreen';
import TrainerClassListScreen from '../screens/TrainerClassListScreen';
import TrainerClassDetailScreen from '../screens/TrainerClassDetailScreen';
import PokedexListScreen from '../screens/PokedexListScreen';
import PokemonDetailScreen from '../screens/PokemonDetailScreen';
import CharacterListScreen from '../screens/CharacterListScreen';
import CharacterSheetScreen from '../screens/CharacterSheetScreen';
import PokemonSheetScreen from '../screens/PokemonSheetScreen';
import PickClassScreen from '../screens/PickClassScreen';
import AddPokemonScreen from '../screens/AddPokemonScreen';
import GmGuideListScreen from '../screens/GmGuideListScreen';
import GmGuideDetailScreen from '../screens/GmGuideDetailScreen';
import ItemsListScreen from '../screens/ItemsListScreen';
import ItemDetailScreen from '../screens/ItemDetailScreen';
import PickMoveScreen from '../screens/PickMoveScreen';

const HomeStack = createNativeStackNavigator();
const ClassesStack = createNativeStackNavigator();
const DexStack = createNativeStackNavigator();
const CharactersStack = createNativeStackNavigator();
const GmGuideStack = createNativeStackNavigator();
const ItemsStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.text,
  headerTitleStyle: { color: colors.text },
  contentStyle: { backgroundColor: colors.background },
};

function HomeStackNav() {
  return (
    <HomeStack.Navigator screenOptions={screenOptions}>
      <HomeStack.Screen name="Home" component={HomeScreen} options={{ title: 'PTA Lookup' }} />
    </HomeStack.Navigator>
  );
}

function ClassesStackNav() {
  return (
    <ClassesStack.Navigator screenOptions={screenOptions}>
      <ClassesStack.Screen name="ClassList" component={TrainerClassListScreen} options={{ title: 'Trainer Classes' }} />
      <ClassesStack.Screen name="ClassDetail" component={TrainerClassDetailScreen} options={{ title: 'Class Detail' }} />
    </ClassesStack.Navigator>
  );
}

function DexStackNav() {
  return (
    <DexStack.Navigator screenOptions={screenOptions}>
      <DexStack.Screen name="DexList" component={PokedexListScreen} options={{ title: 'Pokédex' }} />
      <DexStack.Screen name="DexDetail" component={PokemonDetailScreen} options={{ title: 'Pokémon' }} />
    </DexStack.Navigator>
  );
}

function CharactersStackNav() {
  return (
    <CharactersStack.Navigator screenOptions={screenOptions}>
      <CharactersStack.Screen name="CharacterList" component={CharacterListScreen} options={{ title: 'Characters' }} />
      <CharactersStack.Screen name="CharacterSheet" component={CharacterSheetScreen} options={{ title: 'Character Sheet' }} />
      <CharactersStack.Screen name="PokemonSheet" component={PokemonSheetScreen} options={{ title: 'Pokémon Sheet' }} />
      <CharactersStack.Screen name="PickClass" component={PickClassScreen} options={{ title: 'Choose Class', presentation: 'modal' }} />
      <CharactersStack.Screen name="AddPokemon" component={AddPokemonScreen} options={{ title: 'Add Pokémon', presentation: 'modal' }} />
      <CharactersStack.Screen name="PickItem" component={ItemsListScreen} options={{ title: 'Choose Item', presentation: 'modal' }} />
      <CharactersStack.Screen name="PickMove" component={PickMoveScreen} options={{ title: 'Add Move', presentation: 'modal' }} />
    </CharactersStack.Navigator>
  );
}

function ItemsStackNav() {
  return (
    <ItemsStack.Navigator screenOptions={screenOptions}>
      <ItemsStack.Screen name="ItemList" component={ItemsListScreen} options={{ title: 'Items' }} />
      <ItemsStack.Screen name="ItemDetail" component={ItemDetailScreen} options={{ title: 'Item' }} />
    </ItemsStack.Navigator>
  );
}

function GmGuideStackNav() {
  return (
    <GmGuideStack.Navigator screenOptions={screenOptions}>
      <GmGuideStack.Screen name="GmGuideList" component={GmGuideListScreen} options={{ title: 'GM Guide' }} />
      <GmGuideStack.Screen name="GmGuideDetail" component={GmGuideDetailScreen} options={{ title: 'GM Guide' }} />
    </GmGuideStack.Navigator>
  );
}

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
  },
};

export default function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
        }}
      >
        <Tab.Screen name="HomeTab" component={HomeStackNav} options={{ title: 'Home' }} />
        <Tab.Screen name="ClassesTab" component={ClassesStackNav} options={{ title: 'Classes' }} />
        <Tab.Screen name="DexTab" component={DexStackNav} options={{ title: 'Pokédex' }} />
        <Tab.Screen name="CharactersTab" component={CharactersStackNav} options={{ title: 'Characters' }} />
        <Tab.Screen name="GmGuideTab" component={GmGuideStackNav} options={{ title: 'GM Guide' }} />
        <Tab.Screen name="ItemsTab" component={ItemsStackNav} options={{ title: 'Items' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
