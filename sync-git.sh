#!/bin/bash
# Git sync and commit script for Dhikrtop development

echo "========================================="
echo "Dhikrtop Development Setup"
echo "========================================="
echo ""

# Navigate to project
cd /home/zajalist/projects/dhikrtop

echo "1️⃣  Fetching latest from origin..."
git fetch origin

echo ""
echo "2️⃣  Current status:"
git status

echo ""
echo "3️⃣  Commits ahead/behind origin/main:"
git log --oneline origin/main..HEAD | wc -l
echo "commits ahead"

echo ""
echo "4️⃣  Ready to pull latest from origin/main?"
echo "   This will sync your local repo with GitHub"
echo ""
echo "   If you have uncommitted changes, they'll be preserved."
echo "   Run: git pull origin main"
echo ""
echo "========================================="
